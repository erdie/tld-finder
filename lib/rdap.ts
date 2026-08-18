export interface RdapParsed {
    domainName: string;
    registrar: string | null;
    createdDate: string | null;
    expiryDate: string | null;
    updatedDate: string | null;
    nameServers: string[] | null;
    status: string[] | null;
    entities?: Array<{ role: string; name: string }>;
}

export interface RdapResult {
    domain: string;
    protocol: "rdap";
    isRegistered: boolean;
    parsed: RdapParsed;
    raw: string;
    rdapUrl?: string;
}

/**
 * Perform RDAP lookup for a given domain name.
 * Uses rdap.org bootstrap redirect service or direct RDAP servers.
 */
export async function queryRdap(domain: string): Promise<RdapResult> {
    const cleanDomain = domain.trim().replace(/^\.+/, "").toLowerCase();
    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(cleanDomain)}`;

    const response = await fetch(rdapUrl, {
        headers: {
            "Accept": "application/rdap+json, application/json",
            "User-Agent": "tld-finder/1.0 (RDAP Client)"
        },
        cache: "no-store",
        signal: AbortSignal.timeout(7000)
    });

    if (response.status === 404) {
        let raw = "";
        try {
            const json = await response.json();
            raw = JSON.stringify(json, null, 2);
        } catch {
            raw = `{"status": 404, "message": "Domain ${cleanDomain} not found (available)"}`;
        }
        return {
            domain: cleanDomain,
            protocol: "rdap",
            isRegistered: false,
            parsed: {
                domainName: cleanDomain,
                registrar: null,
                createdDate: null,
                expiryDate: null,
                updatedDate: null,
                nameServers: null,
                status: null
            },
            raw,
            rdapUrl
        };
    }

    if (!response.ok) {
        throw new Error(`RDAP server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const raw = JSON.stringify(data, null, 2);

    // Extract domain name
    const domainName = data.ldhName || cleanDomain;

    // Extract events (registration, expiration, last changed)
    let createdDate: string | null = null;
    let expiryDate: string | null = null;
    let updatedDate: string | null = null;

    if (Array.isArray(data.events)) {
        for (const ev of data.events) {
            const action = String(ev.eventAction || "").toLowerCase();
            const date = ev.eventDate || null;
            if (!date) continue;

            if (action === "registration") {
                createdDate = date;
            } else if (action === "expiration") {
                expiryDate = date;
            } else if (action === "last changed" || action === "last update of rdap database" || action === "last updated") {
                if (!updatedDate || action === "last changed") {
                    updatedDate = date;
                }
            }
        }
    }

    // Extract registrar & entities
    let registrar: string | null = null;
    const entitiesSummary: Array<{ role: string; name: string }> = [];

    if (Array.isArray(data.entities)) {
        for (const entity of data.entities) {
            const roles: string[] = Array.isArray(entity.roles) ? entity.roles : [];
            let entityName = entity.handle || "";

            // Check vcardArray for vcard fn/org
            if (Array.isArray(entity.vcardArray) && Array.isArray(entity.vcardArray[1])) {
                for (const item of entity.vcardArray[1]) {
                    if (Array.isArray(item) && (item[0] === "fn" || item[0] === "org")) {
                        if (item[3]) {
                            entityName = String(item[3]);
                            break;
                        }
                    }
                }
            }

            if (roles.includes("registrar")) {
                registrar = entityName || entity.handle || null;
            }

            if (entityName) {
                roles.forEach(role => {
                    entitiesSummary.push({ role, name: entityName });
                });
            }
        }
    }

    if (!registrar && data.port43) {
        registrar = `WHOIS Server: ${data.port43}`;
    }

    // Extract nameservers
    const nameServers: string[] = [];
    if (Array.isArray(data.nameservers)) {
        for (const ns of data.nameservers) {
            if (ns.ldhName) {
                nameServers.push(ns.ldhName);
            }
        }
    }

    // Extract status array
    const status: string[] = Array.isArray(data.status) ? data.status : [];

    return {
        domain: cleanDomain,
        protocol: "rdap",
        isRegistered: true,
        parsed: {
            domainName,
            registrar,
            createdDate,
            expiryDate,
            updatedDate,
            nameServers: nameServers.length ? nameServers : null,
            status: status.length ? status : null,
            entities: entitiesSummary.length ? entitiesSummary : undefined
        },
        raw,
        rdapUrl
    };
}
