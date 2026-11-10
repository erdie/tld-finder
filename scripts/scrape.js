import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import got from 'got';
import { getBrowserHeaders } from './test-detail-parser.js';

const DATA_FILE = path.resolve(process.cwd(), 'data/iana-tld.json');

(async () => {
    try {
        const url = 'https://www.iana.org/domains/root/db';
        console.log(`🌐 Fetching IANA root database from ${url}...`);

        let responseBody;
        try {
            const response = await got(url, {
                headers: getBrowserHeaders(),
                timeout: { request: 15000 },
                retry: { limit: 2 }
            });
            responseBody = response.body;
        } catch (fetchErr) {
            console.warn(`⚠️ Failed to fetch live IANA database: ${fetchErr.message}. Keeping existing data.`);
            return;
        }

        const dom = new JSDOM(responseBody);
        const doc = dom.window.document;

        // Load existing data to preserve specific classifications (e.g. sponsored, infrastructure, generic-restricted)
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
            // No existing file or parse failure, continue
        }

        // Dynamically locate column indices from thead
        const headers = Array.from(doc.querySelectorAll('table thead th')).map(th => th.textContent.trim().toLowerCase());
        const tldIdx = headers.findIndex(h => h.includes('tld')) !== -1 ? headers.findIndex(h => h.includes('tld')) : 0;
        const typeIdx = headers.findIndex(h => h.includes('type')) !== -1 ? headers.findIndex(h => h.includes('type')) : 2;
        const managerIdx = headers.findIndex(h => h.includes('manager')) !== -1 ? headers.findIndex(h => h.includes('manager')) : 3;

        const rows = doc.querySelectorAll('table tbody tr');
        const compileData = [];

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

            if (!domain || !domain.startsWith('.')) continue;

            const typeCell = cells[typeIdx] || cells[cells.length >= 4 ? 2 : 1];
            const managerCell = cells[managerIdx] || cells[cells.length >= 4 ? 3 : 2];

            const rawType = typeCell ? typeCell.textContent.trim() : '';
            let type = rawType.toLowerCase().replace(/\s+/g, '-');

            // Preserve specific known classification if previously assigned (sponsored, infrastructure, generic-restricted)
            const prev = existingMap.get(domain);
            if (prev && ['sponsored', 'infrastructure', 'generic-restricted'].includes(prev.type)) {
                type = prev.type;
            }

            const rawManager = managerCell ? managerCell.textContent.replace(/\s+/g, ' ').trim() : '';
            const manager = rawManager || 'Not assigned';

            compileData.push({
                domain,
                type,
                tldManager: manager,
            });
        }

        console.log(`📊 Parsed ${compileData.length} TLDs from IANA database.`);

        // Critical safety gate: NEVER overwrite with an empty or drastically incomplete dataset
        if (compileData.length < 1000) {
            console.warn(`⚠️ Warning: Parsed only ${compileData.length} TLDs (expected >= 1000). Aborting write to protect existing dataset.`);
            return;
        }

        await fs.writeFile(DATA_FILE, JSON.stringify(compileData, null, 2), 'utf-8');
        console.log(`✅ Successfully updated ${DATA_FILE} with ${compileData.length} TLDs.`);
    } catch (err) {
        console.error('Error in scrape script:', err.message);
    }
})();
