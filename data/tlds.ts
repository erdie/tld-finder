import tldData from './iana-tld.json';

export interface TLD {
    domain: string;
    type: string;
    tldManager: string;
}

export interface NameServerInfo {
    host: string;
    ips: string[];
}

export interface TLDDetail {
    domain: string;
    title: string;
    type: string;
    sponsoringOrg: string;
    adminContact: string;
    techContact: string;
    nameServers: NameServerInfo[];
    registryUrl: string | null;
    whoisServer: string | null;
    rdapServer: string | null;
    registrationDate: string | null;
    lastUpdated: string | null;
    scrapedAt: string;
}

export const tlds: TLD[] = tldData;

// Synchronously or dynamically read iana-tld-details.json if available
import detailsDataRaw from './iana-tld-details.json' with { type: 'json' };

const detailsList: TLDDetail[] = (detailsDataRaw as TLDDetail[]) || [];
const detailsMap: Record<string, TLDDetail> = {};

detailsList.forEach(item => {
    if (item && item.domain) {
        detailsMap[item.domain.toLowerCase().replace(/^\./, '')] = item;
    }
});

export function getTldDetail(domain: string): TLDDetail | null {
    const clean = domain.toLowerCase().replace(/^\./, '');
    return detailsMap[clean] || null;
}

export function getAllTldDetails(): TLDDetail[] {
    return detailsList;
}
