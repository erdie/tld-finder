"use client"

import * as React from "react"
import { Search, Filter, FilterX, Radio, Zap, ShieldAlert } from 'lucide-react'
import type { TLD } from "@/data/tlds"
import { tlds } from "@/data/tlds"
import { Input } from "@/components/ui/input"
import { TldList } from "@/components/tld-list"
import { DomainHacks } from "@/components/domain-hacks"
import { generateDomainHacks, type DomainHack } from "@/lib/domain-hacks"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function isDomainQuery(q: string): boolean {
    const clean = q.trim().replace(/^\.+/, "");
    return clean.includes(".") && clean.split(".").filter(Boolean).length >= 2;
}

export function SearchForm() {
    const [query, setQuery] = React.useState("")
    const [type, setType] = React.useState("all")
    const [assignment, setAssignment] = React.useState("all")
    const [protocol, setProtocol] = React.useState<"auto" | "rdap" | "whois">("auto")
    const [byExtensions, setByExtensions] = React.useState(false)
    const [byManagers, setByManagers] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const [results, setResults] = React.useState<TLD[]>([])
    const [domainHacks, setDomainHacks] = React.useState<DomainHack[]>([])
    const [showAdvanced, setShowAdvanced] = React.useState(false)

    // Lookup / WHOIS / RDAP States
    const [isWhoisMode, setIsWhoisMode] = React.useState(false)
    const [whoisResult, setWhoisResult] = React.useState<any>(null)
    const [whoisError, setWhoisError] = React.useState<string | null>(null)

    // Precomputed TLD category counts for live filter options
    const totalTldsCount = tlds.length;
    const genericCount = React.useMemo(() => tlds.filter(t => t.type === 'generic').length, []);
    const countryCodeCount = React.useMemo(() => tlds.filter(t => t.type === 'country-code').length, []);
    const sponsoredCount = React.useMemo(() => tlds.filter(t => t.type === 'sponsored').length, []);
    const assignedCount = React.useMemo(() => tlds.filter(t => t.tldManager.toLowerCase() !== 'not assigned').length, []);
    const unassignedCount = React.useMemo(() => tlds.filter(t => t.tldManager.toLowerCase() === 'not assigned').length, []);

    const hasActiveFilters = type !== "all" || assignment !== "all" || protocol !== "auto" || byExtensions || byManagers;

    // Read initial query string on mount
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const initialDomain = params.get("domain") || params.get("q") || "";
            if (initialDomain) {
                setQuery(initialDomain);
            }
        }
    }, []);

    async function searchTlds() {
        setIsLoading(true)
        setWhoisError(null)

        const trimmedQuery = query.trim()
        const isExtensionQuery = trimmedQuery.startsWith(".") || (byExtensions && !byManagers);

        // Generate Domain Hacks for non-empty search terms (skip for extension searches)
        if (trimmedQuery.length >= 3 && !isExtensionQuery) {
            const hacks = generateDomainHacks(trimmedQuery);
            setDomainHacks(hacks);
        } else {
            setDomainHacks([]);
        }

        if (isDomainQuery(trimmedQuery)) {
            setIsWhoisMode(true)
            setResults([]) // clear TLD results
            const cleanDomain = trimmedQuery.replace(/^\.+/, "")

            // Sync to URL query parameters
            if (typeof window !== "undefined") {
                const newUrl = `${window.location.pathname}?domain=${encodeURIComponent(cleanDomain)}`
                window.history.replaceState(null, '', newUrl)
            }

            try {
                const response = await fetch(`/api/whois?domain=${encodeURIComponent(cleanDomain)}&protocol=${protocol}`)
                if (!response.ok) {
                    const errData = await response.json()
                    throw new Error(errData.error || "Failed to fetch domain lookup info")
                }
                const data = await response.json()
                setWhoisResult(data)
            } catch (error: any) {
                console.error("Error fetching domain lookup data:", error)
                setWhoisError(error.message || "Failed to fetch domain lookup data")
                setWhoisResult(null)
            } finally {
                setIsLoading(false)
            }
            return
        }

        // Standard TLD Search Mode
        setIsWhoisMode(false)
        setWhoisResult(null)

        // Remove domain param from URL if it exists
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.has("domain")) {
                params.delete("domain");
                const searchStr = params.toString();
                const newUrl = `${window.location.pathname}${searchStr ? `?${searchStr}` : ""}`;
                window.history.replaceState(null, '', newUrl);
            }
        }

        try {
            const params = new URLSearchParams({
                q: query,
                type: type !== "all" ? type : "",
                assignment: assignment !== "all" ? assignment : "",
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
    }, [query, type, assignment, protocol, byExtensions, byManagers])

    const handleSelectHack = (hackDomain: string) => {
        setQuery(hackDomain);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="relative flex items-center gap-2">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search TLD (e.g., .com), lookup domain (e.g., google.com), or type keyword for Domain Hacks..."
                        className="pl-10 pr-4 bg-muted/50 text-base font-light py-3"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button
                        variant={hasActiveFilters ? "default" : "outline"}
                        size="icon"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`cursor-pointer ${hasActiveFilters ? "shadow-sm" : "bg-muted/50"}`}
                        title="Toggle filters & protocol settings"
                    >
                        {showAdvanced ? (
                            <FilterX className="h-4 w-4" />
                        ) : (
                            <Filter className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {isDomainQuery(query) && (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 rounded-lg animate-fade-in text-xs">
                        <div className="flex items-center gap-2 text-blue-400 font-mono">
                            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                            Domain Lookup Active: checking "{query.trim().replace(/^\.+/, "")}"
                        </div>

                        {/* Protocol Selection Toggle */}
                        <div className="flex items-center gap-1.5 font-sans">
                            <span className="text-muted-foreground font-medium">Protocol:</span>
                            <button
                                onClick={() => setProtocol("auto")}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                    protocol === "auto"
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-muted/80 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                Auto (RDAP preferred)
                            </button>
                            <button
                                onClick={() => setProtocol("rdap")}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                    protocol === "rdap"
                                        ? "bg-purple-600 text-white shadow-xs"
                                        : "bg-muted/80 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                RDAP (RESTful JSON)
                            </button>
                            <button
                                onClick={() => setProtocol("whois")}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                                    protocol === "whois"
                                        ? "bg-amber-600 text-white shadow-xs"
                                        : "bg-muted/80 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                WHOIS (Port 43)
                            </button>
                        </div>
                    </div>
                )}

                {showAdvanced && (
                    <div className="border rounded-lg p-4 bg-card text-card-foreground shadow-xs animate-fade-in space-y-4">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Filter className="h-3.5 w-3.5 text-primary" /> Filter Options
                            </span>
                            <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                                {isLoading ? "Counting..." : `${results.length} TLDs matching filter`}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">TLD Type Filter</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="cursor-pointer w-full">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="cursor-pointer">All Types ({totalTldsCount})</SelectItem>
                                        <SelectItem value="generic" className="cursor-pointer">Generic ({genericCount})</SelectItem>
                                        <SelectItem value="country-code" className="cursor-pointer">Country Code ({countryCodeCount})</SelectItem>
                                        <SelectItem value="sponsored" className="cursor-pointer">Sponsored ({sponsoredCount})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">Assignment Filter</Label>
                                <Select value={assignment} onValueChange={setAssignment}>
                                    <SelectTrigger className="cursor-pointer w-full">
                                        <SelectValue placeholder="Assignment Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="cursor-pointer">All TLDs ({totalTldsCount})</SelectItem>
                                        <SelectItem value="assigned" className="cursor-pointer">Assigned Only ({assignedCount})</SelectItem>
                                        <SelectItem value="unassigned" className="cursor-pointer">Not Assigned Only ({unassignedCount})</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">Lookup Protocol</Label>
                                <Select value={protocol} onValueChange={(val: any) => setProtocol(val)}>
                                    <SelectTrigger className="cursor-pointer w-full">
                                        <SelectValue placeholder="Protocol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto" className="cursor-pointer">Auto (RDAP -&gt; WHOIS fallback)</SelectItem>
                                        <SelectItem value="rdap" className="cursor-pointer">RDAP (Registration Data Access Protocol)</SelectItem>
                                        <SelectItem value="whois" className="cursor-pointer">WHOIS (Traditional Port 43)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40 text-xs">
                            <div className="flex items-center space-x-4">
                                <span className="text-muted-foreground font-medium">Search Scope:</span>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="byExtensions"
                                        checked={byExtensions}
                                        onCheckedChange={(checked) => setByExtensions(checked as boolean)}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="byExtensions" className="cursor-pointer">Extensions</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="byManagers"
                                        checked={byManagers}
                                        onCheckedChange={(checked) => setByManagers(checked as boolean)}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="byManagers" className="cursor-pointer">Managers</Label>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hideUnassigned"
                                    checked={assignment === "assigned"}
                                    onCheckedChange={(checked) => setAssignment(checked ? "assigned" : "all")}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="hideUnassigned" className="cursor-pointer font-medium">
                                    Hide "Not assigned" TLDs
                                </Label>
                            </div>
                        </div>
                    </div>
                )}

                {!isWhoisMode && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground px-1 font-mono">
                        <div>
                            Showing <strong className="text-foreground">{isLoading ? '...' : results.length}</strong> of <strong className="text-foreground">{totalTldsCount}</strong> TLDs
                        </div>
                        {hasActiveFilters && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {type !== "all" && (
                                    <Badge variant="secondary" className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-sans">
                                        Type: {type}
                                        <button onClick={() => setType("all")} className="hover:text-foreground cursor-pointer ml-0.5">✕</button>
                                    </Badge>
                                )}
                                {assignment !== "all" && (
                                    <Badge variant="secondary" className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-sans">
                                        Assignment: {assignment}
                                        <button onClick={() => setAssignment("all")} className="hover:text-foreground cursor-pointer ml-0.5">✕</button>
                                    </Badge>
                                )}
                                {byExtensions && (
                                    <Badge variant="secondary" className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-sans">
                                        Scope: Extensions
                                        <button onClick={() => setByExtensions(false)} className="hover:text-foreground cursor-pointer ml-0.5">✕</button>
                                    </Badge>
                                )}
                                {byManagers && (
                                    <Badge variant="secondary" className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-sans">
                                        Scope: Managers
                                        <button onClick={() => setByManagers(false)} className="hover:text-foreground cursor-pointer ml-0.5">✕</button>
                                    </Badge>
                                )}
                                <button
                                    onClick={() => {
                                        setType("all");
                                        setAssignment("all");
                                        setProtocol("auto");
                                        setByExtensions(false);
                                        setByManagers(false);
                                    }}
                                    className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer ml-1 font-sans"
                                >
                                    Reset filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Domain Hacks Section */}
            {domainHacks.length > 0 && (
                <DomainHacks
                    hacks={domainHacks}
                    query={query.trim()}
                    onSelectHack={handleSelectHack}
                />
            )}

            <TldList
                results={results}
                query={query}
                isLoading={isLoading}
                isWhoisMode={isWhoisMode}
                whoisResult={whoisResult}
                whoisError={whoisError}
            />
        </div>
    )
}
