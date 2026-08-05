import { SearchForm } from "@/components/search-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { GithubStarButton } from "@/components/github-star"
import { JetBrains_Mono } from 'next/font/google'
import { tlds } from "@/data/tlds"

const mono = JetBrains_Mono({ subsets: ["latin"] })

export default function Home() {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-between">
            <header className="container py-4 mx-auto px-4">
                <div className="mx-auto max-w-4xl flex justify-end gap-1">
                    <GithubStarButton />
                    <ThemeToggle />
                </div>
            </header>

            <main className="container py-4 md:py-6 mx-auto flex-1">
                <div className="mx-auto max-w-4xl space-y-8 px-4">
                    <div className="space-y-2 text-center pb-1 md:pb-4">
                        <p className="text-xs text-muted-foreground font-normal bg-muted-foreground/10 hover:bg-muted-foreground/15 rounded-full py-1.5 space-y-2 block w-72 mx-auto border-muted-foreground/20 border">
                            <strong>{tlds.length}</strong> TLDs registered in the <a href="https://www.iana.org/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">IANA Root Zone</a>
                        </p>
                        <h1 className={`text-4xl md:text-6xl font-extrabold pb-2 pt-6 ${mono.className}`}>.tld-finder</h1>
                        <p className="text-muted-foreground font-extralight text-xl">
                            Find out who runs the web's top-level domains
                        </p>
                    </div>

                    <SearchForm />

                    {/* SEO Informational Section */}
                    <section aria-label="About TLD Finder & Domain Search" className="pt-12 pb-6 border-t border-border/40 space-y-6 text-sm text-muted-foreground leading-relaxed">
                        <h2 className="text-lg font-bold text-foreground tracking-tight">About Top-Level Domain Extensions &amp; Registry Operators</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground text-sm">Generic &amp; Country Code TLDs</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The Internet Assigned Numbers Authority (IANA) manages over 1,500 top-level domains (TLDs) in the Root Zone.
                                    These include generic TLDs (gTLDs like <code className="text-foreground font-mono">.com</code>, <code className="text-foreground font-mono">.dev</code>, <code className="text-foreground font-mono">.app</code>), country-code TLDs (ccTLDs like <code className="text-foreground font-mono">.id</code>, <code className="text-foreground font-mono">.uk</code>, <code className="text-foreground font-mono">.jp</code>), and sponsored TLDs (sTLDs like <code className="text-foreground font-mono">.edu</code>, <code className="text-foreground font-mono">.gov</code>).
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground text-sm">Live WHOIS &amp; RDAP Lookups</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Perform domain lookups using traditional port 43 WHOIS or RESTful JSON Registration Data Access Protocol (RDAP) to verify domain availability, creation dates, expiration dates, DNS nameservers, and registrar organization details.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
                <div className="container mx-auto px-4 max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>© {new Date().getFullYear()} TLD Finder — Explore IANA Root Zone Extensions &amp; Registry Managers</p>
                    <div className="flex items-center gap-4">
                        <a href="https://www.iana.org/domains/root/db" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition underline">IANA Database</a>
                        <a href="https://rdap.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition underline">RDAP Protocol</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
