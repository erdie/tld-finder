export function getBaseUrl(): string {
    const raw = process.env.NEXT_PUBLIC_BASE_URL || 'https://tld-finder.erdiawan.com';
    let url = raw.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }
    return url.replace(/\/+$/, '');
}

export const BASE_URL = getBaseUrl();
