"use client"

import * as React from "react"
import { Search, Filter, FilterX } from 'lucide-react'
import type { TLD } from "@/data/tlds"
import { Input } from "@/components/ui/input"
import { TldList } from "@/components/tld-list"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SearchForm() {
    const [query, setQuery] = React.useState("")
    const [type, setType] = React.useState("all")
    const [byExtensions, setByExtensions] = React.useState(false)
    const [byManagers, setByManagers] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [results, setResults] = React.useState<TLD[]>([])
    const [showAdvanced, setShowAdvanced] = React.useState(false)

    async function searchTlds() {
        setIsLoading(true)

        try {
            const params = new URLSearchParams({
                q: query,
                type: type !== "all" ? type : "",
                byExtensions: byExtensions.toString(),
                byManagers: byManagers.toString()
            })
            const response = await fetch(`/api/tld?${params}`)
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
            searchTlds()
        }, 300)

        return () => clearTimeout(timer)
    }, [query, type, byExtensions, byManagers])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="relative flex items-center gap-2">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search domain extension or manager"
                        className="pl-10 pr-12 bg-muted/50 text-base font-light py-3"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="cursor-pointer bg-muted/50"
                    >
                        {showAdvanced ? (
                            <FilterX className="h-4 w-4" />
                        ) : (
                            <Filter className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {showAdvanced && (
                    <div className="border rounded-lg p-4 bg-card text-card-foreground shadow-xs animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="generic">Generic</SelectItem>
                                    <SelectItem value="country-code">Country Code</SelectItem>
                                    <SelectItem value="sponsored">Sponsored</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="grid grid-cols-2 w-full justify-center">
                                <div className="flex items-center space-x-2 justify-center">
                                    <Checkbox
                                        id="byExtensions"
                                        checked={byExtensions}
                                        onCheckedChange={(checked) => setByExtensions(checked as boolean)}
                                    />
                                    <Label htmlFor="byExtensions">By Extensions</Label>
                                </div>
                                <div className="flex items-center space-x-2 justify-center">
                                    <Checkbox
                                        id="byManagers"
                                        checked={byManagers}
                                        onCheckedChange={(checked) => setByManagers(checked as boolean)}
                                    />
                                    <Label htmlFor="byManagers">By Managers</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <TldList results={results} query={query} isLoading={isLoading} />
        </div>
    )
}

