import { SearchForm } from "@/components/search-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { GithubStarButton } from "@/components/github-star"
import { JetBrains_Mono } from 'next/font/google'
import { tlds } from "@/data/tlds"

const mono = JetBrains_Mono({ subsets: ["latin"] })

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container py-6 md:py-8 mx-auto">
                <div className="mx-auto max-w-[800px] space-y-8 px-4">
                    <div className="flex justify-end gap-1">
                        <GithubStarButton />
                        <ThemeToggle />
                    </div>
                    <div className="space-y-2 text-center pb-1 md:pb-4">
                        <p className="text-xs text-muted-foreground font-normal bg-muted-foreground/10 hover:bg-muted-foreground/15 rounded-full py-1.5 space-y-2 block w-72 mx-auto border-muted-foreground/20 border">
                            <strong>{tlds.length}</strong> TLD domain extensions registered in <a href="https://www.iana.org/" className="text-blue-500 hover:underline">IANA</a>
                        </p>
                        <h1 className={`text-4xl md:text-6xl font-extrabold pb-2 pt-6 ${mono.className}`}>.tld-finder</h1>
                        <p className="text-muted-foreground font-light text-lg">
                            Explore the world&apos;s top-level domains and uncover the organizations that manage them!
                        </p>
                    </div>
                    <SearchForm />
                </div>
            </main>
        </div>
    )
}

