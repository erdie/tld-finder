import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import got from 'got';

(async () => {
    try {
        const url = 'https://www.iana.org/domains/root/db';
        const response = await got(url);
        const dom = new JSDOM(response.body);

        const selectDomain = dom.window.document.querySelectorAll('table td:nth-child(1) span a');
        const selectType = dom.window.document.querySelectorAll('table tr td:nth-child(2)');
        const selectTldManager = dom.window.document.querySelectorAll('table tr td:nth-child(3)');

        const compileData = Array.from(selectDomain).map((item, index) => {
            const domain = item.textContent.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim();
            const type = selectType[index].textContent.trim();
            const manager = selectTldManager[index].textContent.trim();
            console.log(`Scraping tld: ${domain}, type: ${type}, manager: ${manager}`);
            return {
                domain,
                type,
                tldManager: manager,
            };
        });

        await fs.writeFile('./data/iana-tld.json', JSON.stringify(compileData, null, 2));
        console.log('Successfully wrote file');
    } catch (err) {
        console.error('Error:', err);
    }
})();
