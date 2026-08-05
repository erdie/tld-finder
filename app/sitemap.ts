import type { MetadataRoute } from 'next';
import { tlds } from '@/data/tlds';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://tld-finder.erdiawan.com';
    const now = new Date();

    const tldEntries: MetadataRoute.Sitemap = tlds.map(tld => {
        const cleanDomain = tld.domain.toLowerCase().replace(/^\./, '');
        return {
            url: `${baseUrl}/tld/${cleanDomain}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.8,
        };
    });

    return [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        ...tldEntries,
    ];
}
