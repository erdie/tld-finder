import fs from 'node:fs/promises';
import path from 'node:path';
import urlModule from 'node:url';
import got from 'got';
import { parseIanaDetailPage, getBrowserHeaders } from './test-detail-parser.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LIST_FILE = path.join(DATA_DIR, 'iana-tld.json');
const DETAILS_FILE = path.join(DATA_DIR, 'iana-tld-details.json');

// Parse CLI flags
const args = process.argv.slice(2);
const forceFlag = args.includes('--force');
const tldArg = args.find(a => a.startsWith('--tld='))?.split('=')[1]?.toLowerCase().replace(/^\./, '');
const limitArg = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '0', 10);
const concurrencyArg = parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '5', 10);

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const headers = getBrowserHeaders();
            const response = await got(url, {
                headers,
                timeout: { request: 15000 },
                retry: { limit: 0 } // handled manually
            });
            return response.body;
        } catch (err) {
            if (attempt === maxRetries) throw err;
            const backoffMs = attempt * 1500 + Math.floor(Math.random() * 500);
            console.warn(`⚠️ [Attempt ${attempt}/${maxRetries}] Failed ${url}: ${err.message}. Retrying in ${backoffMs}ms...`);
            await delay(backoffMs);
        }
    }
}

export async function scrapeTldDetail(domain) {
    const cleanDomain = domain.toLowerCase().replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/^\./, '').trim();
    if (!cleanDomain) throw new Error('Empty domain name');
    const asciiDomain = urlModule.domainToASCII(cleanDomain);
    const targetUrl = `https://www.iana.org/domains/root/db/${asciiDomain}.html`;
    const html = await fetchWithRetry(targetUrl);
    return parseIanaDetailPage(html, cleanDomain);
}

export async function runScraper() {
    console.log('🚀 Starting IANA TLD Detail Scraper with Browser-Mimicry Stealth Headers...');

    // Load master list
    let masterList = [];
    try {
        const rawList = await fs.readFile(LIST_FILE, 'utf-8');
        masterList = JSON.parse(rawList);
    } catch (err) {
        console.error(`❌ Could not load ${LIST_FILE}. Make sure to run 'yarn scrape' first.`);
        process.exit(1);
    }

    // Load existing details map
    const existingMap = {};
    try {
        const rawDetails = await fs.readFile(DETAILS_FILE, 'utf-8');
        const list = JSON.parse(rawDetails);
        if (Array.isArray(list)) {
            list.forEach(item => {
                if (item && item.domain) {
                    existingMap[item.domain.toLowerCase()] = item;
                }
            });
        }
    } catch (err) {
        console.log('ℹ️ No existing details cache found. Starting fresh.');
    }

    // Determine target domains
    let targetDomains = masterList
        .map(item => item.domain.toLowerCase().replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/^\./, '').trim())
        .filter(Boolean);
    if (tldArg) {
        targetDomains = targetDomains.filter(d => d === tldArg);
        if (targetDomains.length === 0) {
            targetDomains = [tldArg];
        }
    }

    if (!forceFlag) {
        targetDomains = targetDomains.filter(d => !existingMap[d]);
    }

    if (limitArg > 0) {
        targetDomains = targetDomains.slice(0, limitArg);
    }

    console.log(`📊 Found ${masterList.length} total TLDs. Target to scrape: ${targetDomains.length} domains.`);

    if (targetDomains.length === 0) {
        console.log('✅ All target TLD details are up to date in cache!');
        return;
    }

    const concurrency = Math.max(1, Math.min(concurrencyArg, 10));
    let completedCount = 0;

    // Helper to save current map state atomically
    async function saveMap() {
        const sortedList = Object.values(existingMap).sort((a, b) => a.domain.localeCompare(b.domain));
        await fs.writeFile(DETAILS_FILE, JSON.stringify(sortedList, null, 2), 'utf-8');
    }

    // Worker pool
    const queue = [...targetDomains];

    async function worker(workerId) {
        while (queue.length > 0) {
            const domain = queue.shift();
            if (!domain) break;

            try {
                // Add random jitter delay (100ms - 350ms) to mimic realistic browsing behaviour
                const jitter = Math.floor(Math.random() * 250) + 100;
                await delay(jitter);

                const detail = await scrapeTldDetail(domain);
                existingMap[domain] = detail;
                completedCount++;

                console.log(`[${completedCount}/${targetDomains.length}] Scraped .${domain} | WHOIS: ${detail.whoisServer || 'N/A'} | RDAP: ${detail.rdapServer ? 'Yes' : 'No'}`);

                // Save periodically every 10 completed items
                if (completedCount % 10 === 0) {
                    await saveMap();
                }
            } catch (err) {
                console.error(`❌ Failed to scrape .${domain}:`, err.message);
            }
        }
    }

    const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
    await Promise.all(workers);

    // Save final output
    await saveMap();
    console.log(`🎉 Scraping finished! Updated details saved to ${DETAILS_FILE}`);
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('scrape-details.js')) {
    runScraper().catch(err => {
        console.error('Fatal Scraper Error:', err);
        process.exit(1);
    });
}
