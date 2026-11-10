import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import got from 'got';
import { getBrowserHeaders } from './test-detail-parser.js';

const DATA_FILE = path.resolve(process.cwd(), 'data/iana-tld.json');
const DETAILS_FILE = path.resolve(process.cwd(), 'data/iana-tld-details.json');
const JSON_URL = 'https://data.iana.org/TLD/v1/tlds.json';
const HTML_URL = 'https://www.iana.org/domains/root/db';

async function fetchFromOfficialJson() {
    console.log(`🌐 Fetching official IANA dataset from ${JSON_URL}...`);
    const headers = getBrowserHeaders();
    const response = await got(JSON_URL, {
        headers,
        timeout: { request: 15000 },
        retry: { limit: 2 }
    });

    const data = JSON.parse(response.body);
    if (!data || !Array.isArray(data.domains)) {
        throw new Error('Invalid JSON structure from IANA endpoint');
    }
    return data.domains;
}

async function scrapeFromHtmlFallback() {
    console.log(`🌐 Fallback: Fetching IANA HTML root database from ${HTML_URL}...`);
    const headers = getBrowserHeaders();
    const response = await got(HTML_URL, {
        headers,
        timeout: { request: 15000 },
        retry: { limit: 2 }
    });

    const dom = new JSDOM(response.body);
    const doc = dom.window.document;

    const headersList = Array.from(doc.querySelectorAll('table thead th')).map(th => th.textContent.trim().toLowerCase());
    const tldIdx = headersList.findIndex(h => h.includes('tld')) !== -1 ? headersList.findIndex(h => h.includes('tld')) : 0;
    const statusIdx = headersList.findIndex(h => h.includes('status')) !== -1 ? headersList.findIndex(h => h.includes('status')) : 1;
    const typeIdx = headersList.findIndex(h => h.includes('type')) !== -1 ? headersList.findIndex(h => h.includes('type')) : 2;
    const managerIdx = headersList.findIndex(h => h.includes('manager')) !== -1 ? headersList.findIndex(h => h.includes('manager')) : 3;

    const rows = doc.querySelectorAll('table tbody tr');
    const items = [];

    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) continue;

        const tldCell = cells[tldIdx] || cells[0];
        const link = tldCell.querySelector('a');
        const linkHtml = link ? link.innerHTML : tldCell.innerHTML;

        const domain = linkHtml
            .replace(/<span[\s\S]*?<\/span>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
            .trim();

        if (!domain) continue;

        const statusCell = statusIdx !== -1 && cells[statusIdx] ? cells[statusIdx] : null;
        const typeCell = cells[typeIdx] || cells[cells.length >= 4 ? 2 : 1];
        const managerCell = cells[managerIdx] || cells[cells.length >= 4 ? 3 : 2];

        const rawStatus = statusCell ? statusCell.textContent.trim().toLowerCase() : 'active';
        const rawType = typeCell ? typeCell.textContent.trim() : '';
        const type = rawType.toLowerCase().replace(/\s+/g, '-');
        const rawManager = managerCell ? managerCell.textContent.replace(/\s+/g, ' ').trim() : '';

        items.push({
            name: domain.replace(/^\./, ''),
            ulabel: domain.startsWith('.') ? domain.slice(1) : domain,
            type,
            status: rawStatus.includes('retired') ? 'retired' : 'active',
            manager: { organization: rawManager || 'Not assigned' }
        });
    }

    return items;
}

(async () => {
    try {
        // Load existing master list to preserve specific categorization (e.g., sponsored, infrastructure)
        const existingMap = new Map();
        try {
            const rawExisting = await fs.readFile(DATA_FILE, 'utf-8');
            const parsedExisting = JSON.parse(rawExisting);
            if (Array.isArray(parsedExisting)) {
                parsedExisting.forEach(item => {
                    if (item && item.domain) {
                        existingMap.set(item.domain, item);
                    }
                });
            }
        } catch {
            // No existing file or parse failure
        }

        let rawDomains = [];
        try {
            rawDomains = await fetchFromOfficialJson();
            console.log(`✅ Retrieved ${rawDomains.length} domains from official IANA JSON.`);
        } catch (jsonErr) {
            console.warn(`⚠️ Official JSON failed (${jsonErr.message}). Trying HTML fallback...`);
            rawDomains = await scrapeFromHtmlFallback();
        }

        const compileData = rawDomains.map(d => {
            const domain = d.ulabel ? `.${d.ulabel}` : `.${d.name}`;
            const ascii = `.${d.name}`;

            let type = (d.type || 'generic').toLowerCase().replace(/\s+/g, '-');
            const prev = existingMap.get(domain) || existingMap.get(ascii);
            if (prev && ['sponsored', 'infrastructure', 'generic-restricted'].includes(prev.type)) {
                type = prev.type;
            }

            const status = (d.status || 'active').toLowerCase();
            const manager = d.manager?.organization?.replace(/\s+/g, ' ').trim() || 'Not assigned';

            return {
                domain,
                type,
                tldManager: manager,
                status
            };
        });

        // Ensure unique domains and sort alphabetically
        const uniqueMap = new Map();
        compileData.forEach(item => {
            if (item.domain && !uniqueMap.has(item.domain)) {
                uniqueMap.set(item.domain, item);
            }
        });
        const sortedData = Array.from(uniqueMap.values()).sort((a, b) => a.domain.localeCompare(b.domain));

        console.log(`📊 Total parsed & deduplicated TLDs: ${sortedData.length}.`);

        // Critical safety gate
        if (sortedData.length < 1000) {
            console.warn(`⚠️ Warning: Parsed only ${sortedData.length} TLDs (expected >= 1000). Aborting write to protect existing data.`);
            return;
        }

        await fs.writeFile(DATA_FILE, JSON.stringify(sortedData, null, 2), 'utf-8');
        console.log(`✅ Successfully updated ${DATA_FILE} with ${sortedData.length} TLDs.`);

        // Synchronize status into existing iana-tld-details.json if present
        try {
            const rawDetails = await fs.readFile(DETAILS_FILE, 'utf-8');
            const detailsList = JSON.parse(rawDetails);
            if (Array.isArray(detailsList)) {
                const statusByCleanDomain = new Map();
                sortedData.forEach(item => {
                    const clean = item.domain.toLowerCase().replace(/^\./, '');
                    statusByCleanDomain.set(clean, item.status);
                });

                let updatedDetailsCount = 0;
                detailsList.forEach(detail => {
                    if (detail && detail.domain) {
                        const clean = detail.domain.toLowerCase().replace(/^\./, '');
                        const newStatus = statusByCleanDomain.get(clean);
                        if (newStatus && detail.status !== newStatus) {
                            detail.status = newStatus;
                            updatedDetailsCount++;
                        }
                    }
                });

                if (updatedDetailsCount > 0) {
                    await fs.writeFile(DETAILS_FILE, JSON.stringify(detailsList, null, 2), 'utf-8');
                    console.log(`✅ Synced status for ${updatedDetailsCount} records in ${DETAILS_FILE}.`);
                }
            }
        } catch (detailsErr) {
            console.warn(`ℹ️ Could not sync details status: ${detailsErr.message}`);
        }
    } catch (err) {
        console.error('❌ Error during scrape:', err.message);
    }
})();
