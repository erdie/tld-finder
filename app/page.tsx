import { SearchForm } from "@/components/search-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { JetBrains_Mono } from 'next/font/google'
import { tlds } from "@/data/tlds"

const mono = JetBrains_Mono({ subsets: ["latin"] })

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container py-8 md:py-12">
                <div className="mx-auto max-w-[800px] space-y-8">
                    <div className="space-y-4 text-center">
                        <h1 className={`text-4xl font-bold ${mono.className}`}>.tld-finder</h1>
                        <p className="text-muted-foreground">
                            Find the top-level domains in the world and the organizations who manage it.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            ({tlds.length} domain extension registered in <a href="https://www.iana.org/" className="text-blue-500 hover:underline">IANA</a>)
                        </p>
                    </div>
                    <SearchForm />
                </div>
            </main>
        </div>
    )
}

