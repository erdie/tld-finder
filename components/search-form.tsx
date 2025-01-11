"use client"

import * as React from "react"
import { Search } from 'lucide-react'
import type { TLD } from "@/data/tlds"
import { Input } from "@/components/ui/input"
import { TldList } from "@/components/tld-list"

export function SearchForm() {
    const [query, setQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [results, setResults] = React.useState<TLD[]>([])

    async function searchTlds(value: string) {
        setIsLoading(true)

        try {
            const response = await fetch(`/api/tld?q=${encodeURIComponent(value)}`)
            const data = await response.json()
            setResults(data)
        } catch (error) {
            console.error("Error fetching TLDs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                searchTlds(query)
            } else {
                setResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search domain extension"
                    className="pl-9 bg-muted/50"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <TldList results={results} query={query} isLoading={isLoading} />
        </div>
    )
}

