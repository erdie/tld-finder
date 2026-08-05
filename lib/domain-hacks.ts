import tldsData from '../data/iana-tld.json';

export interface TldInfo {
    domain: string;
    type: string;
    tldManager: string;
}

export interface DomainHack {
    id: string;
    full: string;            // e.g. "antigravi.ty" or "anti.gr/avity" or "in.stagr.am"
    domain: string;          // registerable domain, e.g. "antigravi.ty" or "anti.gr" or "stagr.am"
    name: string;            // domain prefix, e.g. "antigravi" or "anti"
    tld: string;             // extension without dot, e.g. "ty" or "gr" or "am"
    path?: string;           // URL path if any, e.g. "avity"
    sub?: string;            // subdomain if any, e.g. "in"
    type: "direct" | "path" | "subdomain";
    tldType: string;         // e.g. "generic", "country-code", "sponsored"
    tldManager: string;      // TLD manager name
    url: string;             // clickable full URL
}

// Build map of TLDs for fast lookup
const tldMap = new Map<string, TldInfo>();
(tldsData as TldInfo[]).forEach(item => {
    const ext = item.domain.toLowerCase().replace(/^\.+/, "");
    tldMap.set(ext, item);
});

/**
 * Generates all valid domain hacks for a given text input.
 * Supports direct split (antigravi.ty), path split (anti.gr/avity), and subdomain split (in.stagr.am).
 */
export function generateDomainHacks(inputQuery: string): DomainHack[] {
    if (!inputQuery) return [];
    const trimmed = inputQuery.trim();
    if (trimmed.startsWith(".")) return [];

    // Clean input: remove protocol, slashes, trailing dots
    let clean = trimmed.toLowerCase();
    clean = clean.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^\.+/, "").replace(/\.+$/, "");

    // If input is a domain like "antigravity.com", use the main word "antigravity"
    if (clean.includes(".")) {
        const parts = clean.split(".");
        clean = parts[0];
    }

    // Strip non-alphanumeric characters for word splitting
    const word = clean.replace(/[^a-z0-9]/g, "");
    if (word.length < 3) return [];

    const hacks: DomainHack[] = [];
    const seen = new Set<string>();

    const len = word.length;

    // 1. Direct split: word = name + tld => name.tld (e.g. delicio.us, instagr.am, word.press, tldfind.er)
    for (let i = 1; i <= len - 2; i++) {
        const name = word.slice(0, i);
        const tld = word.slice(i);
        const tldMeta = tldMap.get(tld);

        if (tldMeta && name.length >= 1) {
            const full = `${name}.${tld}`;
            if (!seen.has(full)) {
                seen.add(full);
                hacks.push({
                    id: `direct-${full}`,
                    full,
                    domain: full,
                    name,
                    tld,
                    type: "direct",
                    tldType: tldMeta.type,
                    tldManager: tldMeta.tldManager,
                    url: `https://${full}`
                });
            }
        }
    }

    // 2. Path split: word = name + tld + path => name.tld/path (e.g. anti.gr/avity, deli.ci/ous, inst.ag/ram)
    for (let i = 1; i <= len - 3; i++) {
        for (let j = i + 2; j <= len - 1; j++) {
            const name = word.slice(0, i);
            const tld = word.slice(i, j);
            const path = word.slice(j);
            const tldMeta = tldMap.get(tld);

            if (tldMeta && name.length >= 2 && path.length >= 1) {
                const domain = `${name}.${tld}`;
                const full = `${domain}/${path}`;
                if (!seen.has(full)) {
                    seen.add(full);
                    hacks.push({
                        id: `path-${full}`,
                        full,
                        domain,
                        name,
                        tld,
                        path,
                        type: "path",
                        tldType: tldMeta.type,
                        tldManager: tldMeta.tldManager,
                        url: `https://${full}`
                    });
                }
            }
        }
    }

    // 3. Subdomain split: word = sub + name + tld => sub.name.tld (e.g. in.stagr.am, de.licio.us)
    for (let i = 1; i <= len - 4; i++) {
        for (let j = i + 2; j <= len - 2; j++) {
            const sub = word.slice(0, i);
            const name = word.slice(i, j);
            const tld = word.slice(j);
            const tldMeta = tldMap.get(tld);

            if (tldMeta && sub.length >= 2 && name.length >= 2) {
                const domain = `${name}.${tld}`;
                const full = `${sub}.${domain}`;
                if (!seen.has(full)) {
                    seen.add(full);
                    hacks.push({
                        id: `sub-${full}`,
                        full,
                        domain,
                        name,
                        tld,
                        sub,
                        type: "subdomain",
                        tldType: tldMeta.type,
                        tldManager: tldMeta.tldManager,
                        url: `https://${full}`
                    });
                }
            }
        }
    }

    // Sort order: Direct hacks first, then Path hacks, then Subdomain hacks.
    // Within same category, prefer shorter TLDs / popular country codes.
    return hacks.sort((a, b) => {
        const order = { direct: 1, path: 2, subdomain: 3 };
        if (order[a.type] !== order[b.type]) {
            return order[a.type] - order[b.type];
        }
        return a.full.length - b.full.length;
    });
}
