import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTldDetail, tlds, TLDDetail, TLD } from '@/data/tlds';
import { TldDetailClient } from '@/components/tld-detail-client';
import { AiRegistryPopover } from '@/components/ai-registry-popover';
import { Badge } from '@/components/ui/badge';
import { MaterialIcon } from '@/components/ui/material-icon';
import { scrapeTldDetail } from '@/scripts/scrape-details';
import { getBaseUrl } from '@/lib/site-config';

interface PageProps {
    params: Promise<{ domain: string }>;
}

function normalizeDomain(input: string): string {
    return decodeURIComponent(input).toLowerCase().replace(/^\./, '').trim();
}

export async function generateStaticParams() {
    // Return all TLD domains from master IANA list for static page generation
    return tlds.map(tld => ({
        domain: tld.domain.toLowerCase().replace(/^\./, ''),
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { domain: rawDomain } = await params;
    const cleanDomain = normalizeDomain(rawDomain);
    const detail = getTldDetail(cleanDomain);
    const tldBasic = tlds.find(t => t.domain.toLowerCase().replace(/^\./, '') === cleanDomain);
    const baseUrl = getBaseUrl();
    
    // Find TLD meta

    if (!tldBasic && !detail) {
        return {
            title: `TLD .${cleanDomain.toUpperCase()} Not Found | TLD Finder`,
            description: `No record found for top-level domain extension .${cleanDomain}.`
        };
    }

    const domainUpper = cleanDomain.toUpperCase();
    const typeLabel = detail?.type || tldBasic?.type || 'Top-Level Domain';
    const managerName = detail?.sponsoringOrg?.split('\n')[0] || tldBasic?.tldManager || 'IANA Delegated Manager';
    const whoisInfo = detail?.whoisServer ? `WHOIS Server: ${detail.whoisServer}.` : '';

    const title = `.${domainUpper} TLD Delegation Record, Registry Manager & WHOIS | TLD Finder`;
    const description = `Explore official IANA delegation record for .${cleanDomain} (${typeLabel}). Registry manager: ${managerName}. ${whoisInfo} Authoritative name servers, RDAP endpoints, and domain availability lookup.`;
    const canonicalUrl = `${baseUrl}/tld/${cleanDomain}`;

    return {
        title,
        description,
        keywords: [
            `.${cleanDomain} tld`,
            `.${cleanDomain} domain`,
            `${cleanDomain} registry manager`,
            `${cleanDomain} WHOIS lookup`,
            `${cleanDomain} RDAP server`,
            `whois.${cleanDomain}`,
            `delegation record .${cleanDomain}`,
            `top level domain .${cleanDomain}`
        ],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `.${domainUpper} TLD Delegation Record & Registry Details`,
            description,
            url: canonicalUrl,
            siteName: 'TLD Finder',
            type: 'website',
            images: [
                {
                    url: `${baseUrl}/og-tld-${cleanDomain}.png`,
                    width: 1200,
                    height: 630,
                    alt: `.${domainUpper} Top-Level Domain Info`
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        robots: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
        }
    };
}

export default async function TldDetailPage({ params }: PageProps) {
    const { domain: rawDomain } = await params;
    const cleanDomain = normalizeDomain(rawDomain);
    const baseUrl = getBaseUrl();

    const tldBasic = tlds.find(t => t.domain.toLowerCase().replace(/^\./, '') === cleanDomain);
    let detail: TLDDetail | null = getTldDetail(cleanDomain);

    // If detail isn't in pre-rendered cache, try fetching on the fly
    if (!detail && tldBasic) {
        try {
            detail = await scrapeTldDetail(cleanDomain);
        } catch (err) {
            console.warn(`Could not scrape live detail for .${cleanDomain}:`, err);
        }
    }

    if (!tldBasic && !detail) {
        notFound();
    }

    const domainUpper = cleanDomain.toUpperCase();
    const tldType = detail?.type || tldBasic?.type || 'Generic top-level domain';
    const managerName = detail?.sponsoringOrg?.split('\n')[0] || tldBasic?.tldManager || 'IANA Delegated Manager';

    // Parse Sponsoring Org lines
    const sponsoringLines = detail?.sponsoringOrg ? detail.sponsoringOrg.split('\n').filter(Boolean) : [managerName];
    const adminLines = detail?.adminContact ? detail.adminContact.split('\n').filter(Boolean) : [];
    const techLines = detail?.techContact ? detail.techContact.split('\n').filter(Boolean) : [];

    // Filter related TLDs (same type or matching first letter)
    const relatedTlds = tlds
        .filter(t => t.domain.toLowerCase().replace(/^\./, '') !== cleanDomain && (t.type === tldBasic?.type || t.domain.startsWith(cleanDomain[0])))
        .slice(0, 12);

    // Structured JSON-LD Data for SEO
    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": `${baseUrl}/`
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "TLD Directory",
                    "item": `${baseUrl}/#tld-list`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": `.${domainUpper}`,
                    "item": `${baseUrl}/tld/${cleanDomain}`
                }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `.${domainUpper} TLD Delegation Record & Registry Details`,
            "description": `Detailed IANA delegation record for .${cleanDomain} top-level domain (${tldType}).`,
            "url": `${baseUrl}/tld/${cleanDomain}`,
            "mainEntity": {
                "@type": "Organization",
                "name": managerName,
                "description": `Sponsoring Organisation / Registry Manager for .${domainUpper} TLD.`
            }
        }
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary/20 selection:text-primary">
                {/* Material Design 3 Top App Bar */}
                <header className="sticky top-0 z-40 bg-surface-container-lowest/80 dark:bg-surface-container-low/80 backdrop-blur-md border-b border-outline-variant/40 transition-colors duration-300">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 group active:scale-95"
                        >
                            <MaterialIcon name="arrow_back" className="text-[18px] transition-transform group-hover:-translate-x-1" />
                            <span>Back to TLD Directory</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="font-mono text-xs rounded-full border border-outline-variant/40">
                                IANA Root Zone
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <MaterialIcon name="arrow_forward" className="text-[14px] opacity-60" />
                        <Link href="/#tld-list" className="hover:text-primary transition-colors">TLDs</Link>
                        <MaterialIcon name="arrow_forward" className="text-[14px] opacity-60" />
                        <span className="font-mono font-bold text-foreground">.{cleanDomain}</span>
                    </nav>

                    {/* Hero Section - Material Design 3 Large Elevated Card */}
                    <section className="bg-surface-container-high border border-outline-variant/60 rounded-3xl p-6 sm:p-8 shadow-elevation-1 relative overflow-hidden transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-foreground flex items-center gap-1">
                                        <span className="text-primary">.</span>{domainUpper}
                                    </h1>
                                    <Badge variant="secondary" className="h-7 text-xs uppercase px-3 rounded-full font-bold border border-outline-variant/40 inline-flex items-center justify-center">
                                        {tldType}
                                    </Badge>
                                    <Badge variant="success" className="h-7 text-xs px-3 rounded-full inline-flex items-center justify-center gap-1.5 font-semibold">
                                        <MaterialIcon name="check_circle" className="text-[16px]" />
                                        <span>Delegated</span>
                                    </Badge>
                                </div>
                                <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
                                    Delegation Record for <strong className="text-foreground font-semibold">.{domainUpper}</strong> managed by <strong className="text-foreground font-semibold">{managerName}</strong>.
                                </p>
                            </div>

                            {/* Date Badges */}
                            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 font-mono text-xs text-muted-foreground bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 shadow-xs">
                                {detail?.registrationDate && (
                                    <div className="flex items-center gap-2">
                                        <MaterialIcon name="event" className="text-[16px] text-primary" />
                                        <span>Registered: <strong className="text-foreground">{detail.registrationDate}</strong></span>
                                    </div>
                                )}
                                {detail?.lastUpdated && (
                                    <div className="flex items-center gap-2">
                                        <MaterialIcon name="schedule" className="text-[16px] text-amber-500" />
                                        <span>Updated: <strong className="text-foreground">{detail.lastUpdated}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Interactive Client Section: Live WHOIS Lookup */}
                    <TldDetailClient 
                        domain={cleanDomain}
                        whoisServer={detail?.whoisServer || null}
                        rdapServer={detail?.rdapServer || null}
                    />

                    {/* Registry Specs Overview Grid */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 shadow-xs space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">WHOIS Server</span>
                            <p className="font-mono text-sm font-bold text-foreground break-all">
                                {detail?.whoisServer || 'Not Specified'}
                            </p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 shadow-xs space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">RDAP Endpoint</span>
                            <p className="font-mono text-xs font-semibold text-primary break-all">
                                {detail?.rdapServer ? (
                                    <a href={detail.rdapServer} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                        <span>Available</span>
                                        <MaterialIcon name="open_in_new" className="text-[14px]" />
                                    </a>
                                ) : 'Not Configured'}
                            </p>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 shadow-xs space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Registry Services</span>
                            {detail?.registryUrl ? (
                                <a 
                                    href={detail.registryUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-medium text-xs text-primary hover:underline inline-flex items-center gap-1 break-all"
                                >
                                    <span>Official Website</span>
                                    <MaterialIcon name="open_in_new" className="text-[14px]" />
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">Direct URL N/A</span>
                            )}
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 shadow-xs space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Authoritative NS</span>
                            <p className="font-mono text-sm font-bold text-foreground">
                                {detail?.nameServers?.length ? `${detail.nameServers.length} Servers` : 'Standard IANA Root'}
                            </p>
                        </div>
                    </section>

                    {/* Sponsoring Organisation & Contact Information */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <MaterialIcon name="domain" className="text-[20px] text-primary" />
                            Registry Contacts &amp; Delegation Record
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Sponsoring Organisation */}
                            <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <MaterialIcon name="domain" className="text-[18px]" />
                                            </div>
                                            <h3 className="font-bold text-sm text-foreground uppercase tracking-wide truncate">
                                                Sponsoring Organisation
                                            </h3>
                                        </div>
                                        {managerName !== "Not assigned" && (
                                            <AiRegistryPopover
                                                tldManager={managerName}
                                                domain={cleanDomain}
                                                type={tldType}
                                                triggerSize="md"
                                            />
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1.5 font-sans leading-relaxed">
                                        {sponsoringLines.map((line, i) => (
                                            <p key={i} className={i === 0 ? "font-bold text-foreground text-sm" : ""}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Administrative Contact */}
                            <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-lg bg-m3-success-container text-m3-on-success-container flex items-center justify-center">
                                            <MaterialIcon name="person_check" className="text-[18px] text-m3-success" />
                                        </div>
                                        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                                            Administrative Contact
                                        </h3>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1.5 font-sans leading-relaxed">
                                        {adminLines.length > 0 ? (
                                            adminLines.map((line, i) => (
                                                <p key={i} className={i === 0 ? "font-bold text-foreground text-sm" : ""}>
                                                    {line}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground italic">Contact info managed via registry operator.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Technical Contact */}
                            <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-6 shadow-xs space-y-3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-lg bg-m3-tertiary-container text-m3-on-tertiary-container flex items-center justify-center">
                                            <MaterialIcon name="build" className="text-[18px] text-m3-tertiary" />
                                        </div>
                                        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                                            Technical Contact
                                        </h3>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1.5 font-sans leading-relaxed">
                                        {techLines.length > 0 ? (
                                            techLines.map((line, i) => (
                                                <p key={i} className={i === 0 ? "font-bold text-foreground text-sm" : ""}>
                                                    {line}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground italic">Technical contact details managed via registry operator.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Authoritative Name Servers */}
                    {detail?.nameServers && detail.nameServers.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <MaterialIcon name="dns" className="text-[20px] text-primary" />
                                Authoritative Name Servers ({detail.nameServers.length})
                            </h2>

                            <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl overflow-hidden shadow-xs">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs font-mono">
                                        <thead className="bg-surface-container-high border-b border-outline-variant/50 text-muted-foreground font-sans font-semibold uppercase text-[11px]">
                                            <tr>
                                                <th className="py-3.5 px-5">Host Name</th>
                                                <th className="py-3.5 px-5">IP Address(es)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/30">
                                            {detail.nameServers.map((ns, idx) => (
                                                <tr key={idx} className="hover:bg-foreground/5 transition-colors duration-150">
                                                    <td className="py-3 px-5 font-bold text-foreground">{ns.host}</td>
                                                    <td className="py-3 px-5 text-muted-foreground">
                                                        {ns.ips && ns.ips.length > 0 ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                {ns.ips.map((ip, i) => (
                                                                    <span key={i} className="text-primary font-medium">{ip}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span>Address resolved dynamically</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Related TLDs Cross-linking for SEO */}
                    {relatedTlds.length > 0 && (
                        <section className="space-y-4 pt-4 border-t border-outline-variant/40">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <MaterialIcon name="layers" className="text-[20px] text-primary" />
                                Explore Related Top-Level Domains
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {relatedTlds.map((tld, idx) => {
                                    const clean = tld.domain.toLowerCase().replace(/^\./, '');
                                    return (
                                        <Link 
                                            key={idx}
                                            href={`/tld/${clean}`}
                                            className="p-3.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 hover:border-primary/40 rounded-2xl transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 text-center space-y-1 group shadow-xs hover:shadow-elevation-1"
                                        >
                                            <span className="font-mono font-bold text-sm text-foreground group-hover:text-primary transition-colors block">
                                                .{clean}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground block truncate font-sans">
                                                {tld.tldManager}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}


