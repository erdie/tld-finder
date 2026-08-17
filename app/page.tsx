import Link from "next/link"
import { SearchForm } from "@/components/search-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { tlds } from "@/data/tlds"
import type { Metadata } from "next"
import { getBaseUrl } from "@/lib/site-config"
import { MaterialIcon } from "@/components/ui/material-icon"

interface PageProps {
    searchParams: Promise<{ q?: string; domain?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { q, domain } = await searchParams;
    const baseUrl = getBaseUrl();
    const queryTerm = q || domain || "";

    if (queryTerm) {
        return {
            title: `Search results for "${queryTerm}" | TLD Finder`,
            description: `Explore top-level domain extensions, registry operators, and WHOIS/RDAP results matching "${queryTerm}".`,
            alternates: {
                canonical: baseUrl,
            },
            robots: {
                index: false,
                follow: true,
            },
        };
    }

    return {
        alternates: {
            canonical: baseUrl,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
            {/* Material 3 Top App Bar */}
            <header className="w-full bg-transparent transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="font-mono text-base font-bold tracking-tight text-foreground hover:text-primary transition-colors duration-200"
                    >
                        .tld-finder
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </header>


            <main className="container py-6 md:py-10 mx-auto flex-1">
                <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6">
                    {/* Hero Section */}
                    <div className="space-y-4 text-center max-w-3xl mx-auto">
                        {/* M3 Assist Chip */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-outline-variant/40 shadow-xs transition-all duration-200 hover:shadow-elevation-1">
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span>
                                <strong className="font-bold">{tlds.length}</strong> TLDs registered in the{" "}
                                <a 
                                    href="https://www.iana.org/" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-semibold text-primary hover:underline"
                                >
                                    IANA Root Zone
                                </a>
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-mono text-foreground">
                            <span className="text-primary">.</span>tld-finder
                        </h1>

                        <p className="text-muted-foreground text-base sm:text-lg font-normal max-w-xl mx-auto leading-relaxed">
                            Find out who runs the web's top-level domains, check live WHOIS &amp; RDAP availability, and generate creative domain hacks.
                        </p>
                    </div>

                    <SearchForm />

                    {/* SEO Informational Section - M3 Outlined Cards */}
                    <section aria-label="About TLD Finder & Domain Search" className="pt-8 space-y-6">
                        <div className="flex items-center gap-2 text-foreground">
                            <MaterialIcon name="info" className="text-[20px] text-primary" />
                            <h2 className="text-lg font-bold tracking-tight">About Top-Level Domain Extensions &amp; Registry Operators</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-surface-container-low border border-outline-variant/60 rounded-3xl p-6 space-y-2.5 shadow-xs transition-all duration-300">
                                <h3 className="font-bold text-foreground text-sm tracking-wide">
                                    Generic &amp; Country Code TLDs
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The Internet Assigned Numbers Authority (IANA) manages over 1,500 top-level domains (TLDs) in the Root Zone.
                                    These include generic TLDs (gTLDs like <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.com</code>, <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.dev</code>, <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.app</code>), country-code TLDs (ccTLDs like <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.id</code>, <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.uk</code>, <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.jp</code>), and sponsored TLDs (sTLDs like <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.edu</code>, <code className="text-foreground font-mono bg-surface-container-high px-1.5 py-0.5 rounded-md">.gov</code>).
                                </p>
                            </div>
                            
                            <div className="bg-surface-container-low border border-outline-variant/60 rounded-3xl p-6 space-y-2.5 shadow-xs transition-all duration-300">
                                <h3 className="font-bold text-foreground text-sm tracking-wide">
                                    Live WHOIS &amp; RDAP Lookups
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Perform domain lookups using traditional port 43 WHOIS or RESTful JSON Registration Data Access Protocol (RDAP) to verify domain availability, creation dates, expiration dates, DNS nameservers, and registrar organization details.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* M3 Footer */}
            <footer className="border-t border-outline-variant/40 bg-surface-container-lowest/50 dark:bg-surface-container-low/50 py-6 text-xs text-muted-foreground transition-colors duration-300">
                <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>© {new Date().getFullYear()} TLD Finder — Explore IANA Root Zone Extensions &amp; Registry Managers</p>
                    <div className="flex items-center gap-5 font-medium">
                        <a href="https://www.iana.org/domains/root/db" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            IANA Database
                        </a>
                        <a href="https://rdap.org" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            RDAP Protocol
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}


