import got from 'got';
import { JSDOM } from 'jsdom';

const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0'
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function getBrowserHeaders() {
    return {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.iana.org/domains/root/db',
        'Cache-Control': 'max-age=0'
    };
}

export function parseIanaDetailPage(html, tldClean) {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const h1 = doc.querySelector('main h1')?.textContent.trim() || `Delegation Record for .${tldClean.toUpperCase()}`;
    const typeText = doc.querySelector('main > p')?.textContent.trim() || '';
    const type = typeText.replace(/^\(|\)$/g, '').trim();

    let sponsoringOrg = '';
    let adminContact = '';
    let techContact = '';

    const h2Elements = doc.querySelectorAll('main h2');
    h2Elements.forEach(h2 => {
        const title = h2.textContent.trim().toLowerCase();
        let content = '';
        let sibling = h2.nextSibling;
        while (sibling && sibling.nodeName !== 'H2' && sibling.nodeName !== 'SCRIPT') {
            if (sibling.className === 'dtable-wrap' || sibling.nodeName === 'TABLE') break;
            if (sibling.nodeType === 3) { // Text node
                content += sibling.textContent;
            } else if (sibling.nodeType === 1) { // Element node
                if (sibling.nodeName === 'BR') {
                    content += '\n';
                } else {
                    content += sibling.textContent;
                }
            }
            sibling = sibling.nextSibling;
        }

        const cleanText = content
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .join('\n');

        if (title.includes('sponsoring') || title.includes('manager') || title.includes('organisation') || title.includes('organization')) {
            sponsoringOrg = cleanText;
        } else if (title.includes('administrative contact')) {
            adminContact = cleanText;
        } else if (title.includes('technical contact')) {
            techContact = cleanText;
        }
    });

    // Name Servers
    const nameServers = [];
    const nsRows = doc.querySelectorAll('table.dtable tbody tr');
    nsRows.forEach(tr => {
        const host = tr.querySelector('td:nth-child(1)')?.textContent.trim();
        const ipsRaw = tr.querySelector('td:nth-child(2)')?.innerHTML || '';
        const ips = ipsRaw
            .split(/<br\s*\/?>/i)
            .map(ip => ip.replace(/<[^>]+>/g, '').trim())
            .filter(Boolean);

        if (host) {
            nameServers.push({ host, ips });
        }
    });

    // Registry Info
    const bodyText = doc.querySelector('main')?.textContent || '';
    
    // Registry URL - look specifically in the Registry Information section or paragraphs containing "URL for registration services"
    let registryUrl = null;
    const regUrlMatch = html.match(/URL for registration services:<\/b>\s*<a href="([^"]+)"/i) ||
                        html.match(/URL for registration services:\s*<a href="([^"]+)"/i);
    if (regUrlMatch) {
        registryUrl = regUrlMatch[1];
    } else {
        const regAnchor = doc.querySelector('main a[href^="http"]');
        if (regAnchor && !regAnchor.href.includes('iana.org')) {
            registryUrl = regAnchor.href;
        }
    }

    // WHOIS Server
    let whoisServer = null;
    const whoisMatch = html.match(/WHOIS Server:\s*<\/b>\s*([^\s<]+)/i) || bodyText.match(/WHOIS Server:\s*([^\s\n]+)/i);
    if (whoisMatch) {
        whoisServer = whoisMatch[1].trim();
    }

    // RDAP Server
    let rdapServer = null;
    const rdapMatch = html.match(/RDAP Server:\s*<\/b>\s*<a[^>]*>([^<]+)<\/a>/i) || 
                      html.match(/RDAP Server:\s*<\/b>\s*([^\s<]+)/i) ||
                      bodyText.match(/RDAP Server:\s*([^\s\n]+)/i);
    if (rdapMatch) {
        rdapServer = rdapMatch[1].trim();
    }

    // Dates
    let registrationDate = null;
    const regDateMatch = html.match(/Registration date ([0-9]{4}-[0-9]{2}-[0-9]{2})/i) || bodyText.match(/Registration date ([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (regDateMatch) {
        registrationDate = regDateMatch[1];
    }

    let lastUpdated = null;
    const lastUpdatedMatch = html.match(/Record last updated ([0-9]{4}-[0-9]{2}-[0-9]{2})/i) || bodyText.match(/Record last updated ([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (lastUpdatedMatch) {
        lastUpdated = lastUpdatedMatch[1];
    }

    return {
        domain: tldClean,
        title: h1,
        type,
        sponsoringOrg,
        adminContact,
        techContact,
        nameServers,
        registryUrl,
        whoisServer,
        rdapServer,
        registrationDate,
        lastUpdated,
        scrapedAt: new Date().toISOString()
    };
}

async function testSample() {
    const sampleTlds = ['com', 'ai', 'id', 'org', 'uk', 'xyz', 'app'];
    for (const tld of sampleTlds) {
        try {
            const url = `https://www.iana.org/domains/root/db/${tld}.html`;
            const res = await got(url, { headers: getBrowserHeaders() });
            const data = parseIanaDetailPage(res.body, tld);
            console.log(`\n=== TLD .${tld.toUpperCase()} ===`);
            console.log(`Title: ${data.title}`);
            console.log(`Type: ${data.type}`);
            console.log(`Sponsoring Org / Manager:\n${data.sponsoringOrg}`);
            console.log(`WHOIS: ${data.whoisServer} | RDAP: ${data.rdapServer} | Reg URL: ${data.registryUrl}`);
            console.log(`Reg Date: ${data.registrationDate} | Updated: ${data.lastUpdated}`);
            console.log(`Name Servers count: ${data.nameServers.length}`);
        } catch (err) {
            console.error(`Error scraping .${tld}:`, err.message);
        }
    }
}

if (process.argv[1].endsWith('test-detail-parser.js')) {
    testSample();
}
