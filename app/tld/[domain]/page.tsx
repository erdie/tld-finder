import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTldDetail, tlds, TLDDetail, TLD } from '@/data/tlds';
import { TldDetailClient } from '@/components/tld-detail-client';
import { Badge } from '@/components/ui/badge';
import { 
    Globe, Building2, UserCheck, Wrench, Server, 
    Calendar, Clock, ArrowLeft, ExternalLink, ShieldCheck, 
    Layers, Sparkles, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { scrapeTldDetail } from '@/scripts/scrape-details';

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
    
    // Find TLD meta
    const tldBasic = tlds.find(t => t.domain.toLowerCase().replace(/^\./, '') === cleanDomain);
    const detail = getTldDetail(cleanDomain);

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
    const canonicalUrl = `https://tld-finder.erdiawan.com/tld/${cleanDomain}`;

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
                    url: `https://tld-finder.erdiawan.com/og-tld-${cleanDomain}.png`,
                    width: 1200,
                    height: 630,
                    alt: `.${domainUpper} Top-Level Domain Info`
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: `.${domainUpper} TLD Delegation Record & Registry Details`,
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
                    "item": "https://tld-finder.erdiawan.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "TLD Directory",
                    "item": "https://tld-finder.erdiawan.com/#tld-list"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": `.${domainUpper}`,
                    "item": `https://tld-finder.erdiawan.com/tld/${cleanDomain}`
                }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `.${domainUpper} TLD Delegation Record & Registry Details`,
            "description": `Detailed IANA delegation record for .${cleanDomain} top-level domain (${tldType}).`,
            "url": `https://tld-finder.erdiawan.com/tld/${cleanDomain}`,
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

            <main className="min-h-screen bg-background text-foreground pb-20 selection:bg-blue-500/30">
                {/* Header Navbar */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/60">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span>Back to TLD Directory</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
                                IANA Root Zone
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
                    {/* Breadcrumbs */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link href="/#tld-list" className="hover:text-foreground transition-colors">TLDs</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="font-mono font-semibold text-foreground">.{cleanDomain}</span>
                    </nav>

                    {/* Hero Section */}
                    <section className="bg-gradient-to-r from-card via-card/90 to-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-foreground flex items-center gap-2">
                                        <span className="text-blue-500">.</span>{domainUpper}
                                    </h1>
                                    <Badge className="text-xs uppercase px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30">
                                        {tldType}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Delegated
                                    </Badge>
                                </div>
                                <p className="text-base text-muted-foreground max-w-2xl">
                                    Delegation Record for <strong className="text-foreground font-semibold">.{domainUpper}</strong> managed by <strong className="text-foreground font-semibold">{managerName}</strong>.
                                </p>
                            </div>

                            {/* Date Badges */}
                            <div className="flex flex-col sm:flex-row md:flex-col gap-2 font-mono text-xs text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border/50">
                                {detail?.registrationDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                        <span>Registered: <strong className="text-foreground">{detail.registrationDate}</strong></span>
                                    </div>
                                )}
                                {detail?.lastUpdated && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-400" />
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
                        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">WHOIS Server</span>
                            <p className="font-mono text-sm font-bold text-foreground break-all">
                                {detail?.whoisServer || 'Not Specified'}
                            </p>
                        </div>
                        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">RDAP Endpoint</span>
                            <p className="font-mono text-xs font-semibold text-blue-400 break-all">
                                {detail?.rdapServer ? (
                                    <a href={detail.rdapServer} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                        <span>Available</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : 'Not Configured'}
                            </p>
                        </div>
                        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Registry Services</span>
                            {detail?.registryUrl ? (
                                <a 
                                    href={detail.registryUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-medium text-xs text-blue-500 hover:text-blue-400 underline inline-flex items-center gap-1 break-all"
                                >
                                    <span>Official Website</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">Direct URL N/A</span>
                            )}
                        </div>
                        <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Authoritative NS</span>
                            <p className="font-mono text-sm font-bold text-foreground">
                                {detail?.nameServers?.length ? `${detail.nameServers.length} Servers` : 'Standard IANA Root'}
                            </p>
                        </div>
                    </section>

                    {/* Sponsoring Organisation & Contact Information */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <Building2 className="w-5 h-5 text-blue-500" />
                            Registry Contacts & Delegation Record
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Sponsoring Organisation */}
                            <div className="bg-card border border-border/70 rounded-xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Building2 className="w-4 h-4 text-blue-400" />
                                        <h3 className="font-bold text-sm text-foreground uppercase tracking-wide">
                                            Sponsoring Organisation
                                        </h3>
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
                            <div className="bg-card border border-border/70 rounded-xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <UserCheck className="w-4 h-4 text-emerald-400" />
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
                            <div className="bg-card border border-border/70 rounded-xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wrench className="w-4 h-4 text-indigo-400" />
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
                                <Server className="w-5 h-5 text-blue-500" />
                                Authoritative Name Servers ({detail.nameServers.length})
                            </h2>

                            <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs font-mono">
                                        <thead className="bg-muted/60 border-b border-border/60 text-muted-foreground font-sans font-semibold uppercase text-[11px]">
                                            <tr>
                                                <th className="py-3 px-4">Host Name</th>
                                                <th className="py-3 px-4">IP Address(es)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {detail.nameServers.map((ns, idx) => (
                                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-3 px-4 font-bold text-foreground">{ns.host}</td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {ns.ips && ns.ips.length > 0 ? (
                                                            <div className="flex flex-col gap-0.5">
                                                                {ns.ips.map((ip, i) => (
                                                                    <span key={i} className="text-blue-400">{ip}</span>
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
                        <section className="space-y-4 pt-4 border-t border-border/60">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <Layers className="w-5 h-5 text-blue-500" />
                                Explore Related Top-Level Domains
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {relatedTlds.map((tld, idx) => {
                                    const clean = tld.domain.toLowerCase().replace(/^\./, '');
                                    return (
                                        <Link 
                                            key={idx}
                                            href={`/tld/${clean}`}
                                            className="p-3 bg-card hover:bg-muted/60 border border-border/50 hover:border-blue-500/40 rounded-xl transition-all text-center space-y-1 group"
                                        >
                                            <span className="font-mono font-bold text-sm text-foreground group-hover:text-blue-400 transition-colors block">
                                                .{clean}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground block truncate">
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
