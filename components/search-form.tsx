"use client"

import * as React from "react"
import type { TLD } from "@/data/tlds"
import { tlds } from "@/data/tlds"
import { TldList } from "@/components/tld-list"
import { DomainHacks, DomainHacksSkeleton } from "@/components/domain-hacks"
import { generateDomainHacks, type DomainHack } from "@/lib/domain-hacks"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MaterialIcon } from "@/components/ui/material-icon"

function cleanDomainInput(input: string): string {
    return input
        .trim()
        .replace(/^(https?:\/\/)?(www\.)?/, "")
        .replace(/^\.+/, "")
        .replace(/\/.*$/, "")
        .toLowerCase();
}

function isDomainQuery(q: string): boolean {
    const clean = cleanDomainInput(q);
    if (!clean.includes(".")) return false;
    const parts = clean.split(".").filter(Boolean);
    if (parts.length < 2) return false;
    const tldPart = parts[parts.length - 1];
    // TLD extension must be at least 2 characters (e.g. .co, .id, .com, .ai)
    return tldPart.length >= 2;
}

function filterTlds(
    allTlds: TLD[],
    query: string,
    type: string,
    assignment: string,
    byExtensions: boolean,
    byManagers: boolean
): TLD[] {
    const trimmedQuery = query.trim().toLowerCase();
    const isExtensionOnly = trimmedQuery.startsWith(".") || (byExtensions && !byManagers);

    const filtered = allTlds.filter((tld) => {
        const matchesType = type && type !== "all" ? tld.type.toLowerCase() === type.toLowerCase() : true;

        let matchesAssignment = true;
        const isNotAssigned = tld.tldManager.toLowerCase() === "not assigned";
        if (assignment === "assigned") {
            matchesAssignment = !isNotAssigned;
        } else if (assignment === "unassigned") {
            matchesAssignment = isNotAssigned;
        }

        let matchesQuery = true;
        if (trimmedQuery) {
            if (isExtensionOnly) {
                matchesQuery = tld.domain.toLowerCase().includes(trimmedQuery);
            } else if (byManagers) {
                matchesQuery = tld.tldManager.toLowerCase().includes(trimmedQuery);
            } else {
                matchesQuery =
                    tld.domain.toLowerCase().includes(trimmedQuery) ||
                    tld.tldManager.toLowerCase().includes(trimmedQuery);
            }
        }

        return matchesType && matchesAssignment && matchesQuery;
    });

    if (trimmedQuery) {
        filtered.sort((a, b) => {
            const aDom = a.domain.toLowerCase();
            const bDom = b.domain.toLowerCase();

            if (aDom === trimmedQuery && bDom !== trimmedQuery) return -1;
            if (bDom === trimmedQuery && aDom !== trimmedQuery) return 1;

            const aStarts = aDom.startsWith(trimmedQuery);
            const bStarts = bDom.startsWith(trimmedQuery);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            return aDom.length - bDom.length;
        });
    }

    return filtered;
}

export function SearchForm() {
    const [query, setQuery] = React.useState("")
    const [type, setType] = React.useState("all")
    const [assignment, setAssignment] = React.useState("all")
    const [protocol, setProtocol] = React.useState<"auto" | "rdap" | "whois">("auto")
    const [byExtensions, setByExtensions] = React.useState(false)
    const [byManagers, setByManagers] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showAdvanced, setShowAdvanced] = React.useState(false)

    // Lookup / WHOIS / RDAP States
    const [isWhoisMode, setIsWhoisMode] = React.useState(false)
    const [whoisResult, setWhoisResult] = React.useState<any>(null)
    const [whoisError, setWhoisError] = React.useState<string | null>(null)

    const trimmedQuery = query.trim();
    const isDomainSearch = isDomainQuery(trimmedQuery);

    // Synchronous 0ms computed results & hacks on the exact same render frame
    const results = React.useMemo(() => {
        if (isDomainSearch) return [];
        return filterTlds(tlds, trimmedQuery, type, assignment, byExtensions, byManagers);
    }, [trimmedQuery, type, assignment, byExtensions, byManagers, isDomainSearch]);

    const domainHacks = React.useMemo(() => {
        if (isDomainSearch || !trimmedQuery) return [];
        return generateDomainHacks(trimmedQuery);
    }, [trimmedQuery, isDomainSearch]);

    // Precomputed TLD category counts for live filter options
    const totalTldsCount = tlds.length;
    const genericCount = React.useMemo(() => tlds.filter(t => t.type === 'generic').length, []);
    const countryCodeCount = React.useMemo(() => tlds.filter(t => t.type === 'country-code').length, []);
    const sponsoredCount = React.useMemo(() => tlds.filter(t => t.type === 'sponsored').length, []);
    const assignedCount = React.useMemo(() => tlds.filter(t => t.tldManager.toLowerCase() !== 'not assigned').length, []);
    const unassignedCount = React.useMemo(() => tlds.filter(t => t.tldManager.toLowerCase() === 'not assigned').length, []);

    const hasActiveFilters = type !== "all" || assignment !== "all" || protocol !== "auto" || byExtensions || byManagers;

    // Read initial query string on mount & popstate
    React.useEffect(() => {
        const syncFromUrl = () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const initialDomain = params.get("domain") || params.get("q") || "";
                if (initialDomain) {
                    setQuery(initialDomain);
                }
            }
        };

        syncFromUrl();
        if (typeof window !== "undefined") {
            window.addEventListener("popstate", syncFromUrl);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("popstate", syncFromUrl);
            }
        };
    }, []);

    // WHOIS / RDAP async fetch & URL synchronization with race condition protection
    React.useEffect(() => {
        const trimmed = query.trim();

        if (isDomainQuery(trimmed)) {
            const targetDomain = cleanDomainInput(trimmed);
            setIsWhoisMode(true);
            setIsLoading(true);
            setWhoisResult(null);
            setWhoisError(null);

            // Sync URL query string to ?domain=domainname.com
            if (typeof window !== "undefined") {
                const currentParams = new URLSearchParams(window.location.search);
                if (currentParams.get("domain") !== targetDomain) {
                    const newUrl = `${window.location.pathname}?domain=${encodeURIComponent(targetDomain)}`;
                    window.history.replaceState(null, '', newUrl);
                }
            }

            const controller = new AbortController();
            let isCancelled = false;

            const timer = setTimeout(async () => {
                try {
                    const res = await fetch(
                        `/api/whois?domain=${encodeURIComponent(targetDomain)}&protocol=${protocol}`,
                        { signal: controller.signal }
                    );
                    const data = await res.json();
                    if (isCancelled) return;
                    if (!res.ok) {
                        throw new Error(data.error || data.details || "Failed to query WHOIS/RDAP information");
                    }
                    if (cleanDomainInput(data.domain) === targetDomain) {
                        setWhoisResult(data);
                    }
                } catch (err: any) {
                    if (isCancelled || err.name === 'AbortError') return;
                    setWhoisError(err.message || "An unexpected error occurred during domain lookup.");
                } finally {
                    if (!isCancelled) {
                        setIsLoading(false);
                    }
                }
            }, 300);

            return () => {
                isCancelled = true;
                clearTimeout(timer);
                controller.abort();
            };
        }

        // Instant TLD Search Mode
        setIsWhoisMode(false);
        setWhoisResult(null);
        setWhoisError(null);
        setIsLoading(false);

        // Debounced URL sync to avoid spamming history during fast typing
        const urlTimer = setTimeout(() => {
            if (typeof window !== "undefined") {
                const currentParams = new URLSearchParams(window.location.search);
                let updated = false;

                if (currentParams.has("domain")) {
                    currentParams.delete("domain");
                    updated = true;
                }

                if (trimmed) {
                    if (currentParams.get("q") !== trimmed) {
                        currentParams.set("q", trimmed);
                        updated = true;
                    }
                } else if (currentParams.has("q")) {
                    currentParams.delete("q");
                    updated = true;
                }

                if (updated) {
                    const searchStr = currentParams.toString();
                    const newUrl = `${window.location.pathname}${searchStr ? `?${searchStr}` : ""}`;
                    window.history.replaceState(null, '', newUrl);
                }
            }
        }, 200);

        return () => clearTimeout(urlTimer);
    }, [query, protocol]);

    const handleSelectHack = (hackDomain: string) => {
        setQuery(hackDomain);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {/* Material Design 3 Search Bar with WebMCP Form Annotations */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    action="/"
                    method="GET"
                    {...({
                        toolname: "search_tlds",
                        tooldescription: "Search 1,500+ IANA top-level domains by extension or registry manager, or perform live RDAP/WHOIS domain lookup"
                    } as any)}
                    className="relative flex items-center bg-surface-container-high hover:bg-surface-container-highest transition-all duration-300 ease-m3-emphasized rounded-full border border-outline-variant/60 shadow-elevation-1 focus-within:shadow-elevation-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 px-4 h-14 group"
                >
                    <MaterialIcon name="search" className="text-[22px] text-muted-foreground group-focus-within:text-primary transition-colors duration-200 ease-m3-standard flex-shrink-0 mr-3" />
                    
                    <input
                        id="tld-search-input"
                        name="q"
                        type="text"
                        {...({
                            toolparamdescription: "Top-level domain (e.g., .com, .id), domain name for live WHOIS (e.g., google.com), or keyword"
                        } as any)}
                        placeholder="Search TLD (e.g., .com), lookup domain (e.g., google.com), or keyword..."
                        className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground text-sm sm:text-base font-normal focus:outline-hidden focus:ring-0 shadow-none appearance-none"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        aria-label="Search top-level domain or lookup domain"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery("")}
                            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/8 transition-all duration-150 ease-m3-standard active:scale-90 cursor-pointer mr-1"
                            title="Clear search"
                            aria-label="Clear search query"
                        >
                            <MaterialIcon name="close" className="text-[18px]" />
                        </button>
                    )}

                    <div className="h-6 w-px bg-outline-variant/60 mx-1 flex-shrink-0" />

                    <Button
                        id="filter-toggle-button"
                        type="button"
                        variant={hasActiveFilters ? "default" : "ghost"}
                        size="icon-sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`cursor-pointer rounded-full ml-1 transition-all duration-200 ease-m3-standard active:scale-90 ${
                            hasActiveFilters
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "text-muted-foreground hover:text-foreground hover:bg-foreground/8"
                        }`}
                        title="Toggle filters & protocol settings"
                        aria-label="Toggle search filters and lookup protocol settings"
                    >
                        {showAdvanced ? (
                            <MaterialIcon name="filter_alt_off" className="text-[18px] transition-transform duration-200 ease-m3-standard" />
                        ) : (
                            <MaterialIcon name="tune" className="text-[18px] transition-transform duration-200 ease-m3-standard" />
                        )}
                    </Button>
                </form>

                {/* Domain Lookup Active M3 Notice Card */}
                {isDomainQuery(query) && (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary-container text-on-secondary-container px-4 py-3 rounded-2xl animate-shared-axis-y text-xs shadow-xs transition-all duration-300 ease-m3-emphasized">
                        <div className="flex items-center gap-2.5 font-mono">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                            <span className="font-medium">
                                Domain Lookup Active: <strong className="font-bold text-foreground">"{query.trim().replace(/^\.+/, "")}"</strong>
                            </span>
                        </div>

                        {/* M3 Segmented Buttons for Protocol Selection */}
                        <div className="flex items-center gap-1 bg-surface-container-lowest/80 dark:bg-surface-container-low p-1 rounded-full shadow-xs">
                            <button
                                onClick={() => setProtocol("auto")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                    protocol === "auto"
                                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                }`}
                            >
                                Auto (RDAP preferred)
                            </button>
                            <button
                                onClick={() => setProtocol("rdap")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                    protocol === "rdap"
                                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                }`}
                            >
                                ⚡ RDAP (JSON)
                            </button>
                            <button
                                onClick={() => setProtocol("whois")}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                    protocol === "whois"
                                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                }`}
                            >
                                📜 WHOIS (Port 43)
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter Options Panel - M3 Elevated Sheet Card */}
                {showAdvanced && (
                    <div className="rounded-3xl p-5 sm:p-6 bg-surface-container-low text-foreground shadow-elevation-1 animate-expand-container space-y-5 transition-all duration-300 ease-m3-emphasized">
                        <div className="flex items-center justify-between border-b border-surface-container-highest/60 pb-3">
                            <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                <MaterialIcon name="tune" className="text-[18px] text-primary" /> Filter Options
                            </span>
                            <Badge variant="secondary" className="font-mono text-xs bg-secondary text-secondary-foreground">
                                {isLoading ? "Counting..." : `${results.length} TLDs matching`}
                            </Badge>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs font-medium text-muted-foreground mb-2 block">TLD Type Filter</Label>
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
                                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Assignment Filter</Label>
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
                                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Lookup Protocol</Label>
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

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-outline-variant/40 text-xs">
                            <div className="flex items-center space-x-5">
                                <span className="text-muted-foreground font-medium">Search Scope:</span>
                                <div className="flex items-center space-x-2 gap-1.5">
                                    <Checkbox
                                        id="byExtensions"
                                        checked={byExtensions}
                                        onCheckedChange={(checked) => setByExtensions(checked as boolean)}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="byExtensions" className="cursor-pointer text-xs font-medium text-foreground">Extensions</Label>
                                </div>
                                <div className="flex items-center space-x-2 gap-1.5">
                                    <Checkbox
                                        id="byManagers"
                                        checked={byManagers}
                                        onCheckedChange={(checked) => setByManagers(checked as boolean)}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="byManagers" className="cursor-pointer text-xs font-medium text-foreground">Managers</Label>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 gap-1.5">
                                <Checkbox
                                    id="hideUnassigned"
                                    checked={assignment === "assigned"}
                                    onCheckedChange={(checked) => setAssignment(checked ? "assigned" : "all")}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="hideUnassigned" className="cursor-pointer text-xs font-medium text-foreground">
                                    Hide "Not assigned" TLDs
                                </Label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Chips & Count indicator */}
                {!isWhoisMode && (
                    <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs text-muted-foreground px-1 font-mono">
                        <div>
                            Showing <strong className="text-foreground">{isLoading ? '...' : results.length}</strong> of <strong className="text-foreground">{totalTldsCount}</strong> TLDs
                        </div>
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 flex-wrap animate-fade-in">
                                {type !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-sans font-medium border border-outline-variant/40 shadow-xs">
                                        Type: {type}
                                        <button onClick={() => setType("all")} className="hover:text-foreground cursor-pointer ml-0.5 text-xs">✕</button>
                                    </span>
                                )}
                                {assignment !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-sans font-medium border border-outline-variant/40 shadow-xs">
                                        Assignment: {assignment}
                                        <button onClick={() => setAssignment("all")} className="hover:text-foreground cursor-pointer ml-0.5 text-xs">✕</button>
                                    </span>
                                )}
                                {byExtensions && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-sans font-medium border border-outline-variant/40 shadow-xs">
                                        Scope: Extensions
                                        <button onClick={() => setByExtensions(false)} className="hover:text-foreground cursor-pointer ml-0.5 text-xs">✕</button>
                                    </span>
                                )}
                                {byManagers && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-sans font-medium border border-outline-variant/40 shadow-xs">
                                        Scope: Managers
                                        <button onClick={() => setByManagers(false)} className="hover:text-foreground cursor-pointer ml-0.5 text-xs">✕</button>
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        setType("all");
                                        setAssignment("all");
                                        setProtocol("auto");
                                        setByExtensions(false);
                                        setByManagers(false);
                                    }}
                                    className="text-xs text-primary hover:underline font-medium cursor-pointer ml-1 font-sans"
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


