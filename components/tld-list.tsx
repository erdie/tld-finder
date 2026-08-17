import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MaterialIcon } from "@/components/ui/material-icon";
import { AiRegistryPopover } from "@/components/ai-registry-popover";
import type { TLD } from "@/data/tlds";
import { useState, useEffect, useRef, useCallback } from "react";

interface TldListProps {
    results: TLD[];
    query: string;
    isLoading: boolean;
    isWhoisMode?: boolean;
    whoisResult?: any;
    whoisError?: string | null;
}

const TldSkeleton = () => (
    <div className="animate-pulse bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xs">
        {/* Top row: Domain + Badge on left, Details button on right */}
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
                {/* Domain name skeleton */}
                <div className="h-6 w-20 sm:w-24 bg-muted-foreground/20 rounded-lg" />
                {/* Badge skeleton */}
                <div className="h-5 w-16 sm:w-20 bg-muted-foreground/15 rounded-full" />
            </div>
            {/* Details button skeleton */}
            <div className="h-6 w-16 bg-primary/15 rounded-full -mr-1 shrink-0" />
        </div>

        {/* Bottom row: Registry name on left, AI Sparkle button on right */}
        <div className="flex items-center justify-between min-h-8 pt-2 pb-0.5 border-t border-outline-variant/30">
            <div className="flex items-center min-w-0 flex-1 pr-2">
                <div className="h-4 w-3/5 sm:w-1/2 bg-muted-foreground/15 rounded-md" />
            </div>
            <div className="h-7 w-7 rounded-full bg-amber-500/15 -mr-1 shrink-0" />
        </div>
    </div>
);

function WhoisDisplay({ result, error, isLoading }: { result: any; error: string | null; isLoading: boolean }) {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');
    const [copied, setCopied] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Status Hero Card Skeleton */}
                <div className="bg-surface-container-low rounded-3xl p-6 sm:p-8 border border-outline-variant/50 space-y-5 shadow-xs">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3.5">
                            <div className="h-12 w-12 rounded-full bg-muted-foreground/20 shrink-0" />
                            <div className="space-y-2">
                                <div className="h-7 w-40 bg-muted-foreground/20 rounded-xl" />
                                <div className="h-4 w-28 bg-muted-foreground/15 rounded-md" />
                            </div>
                        </div>
                        <div className="h-7 w-24 bg-muted-foreground/15 rounded-full" />
                    </div>
                    <div className="h-10 w-full bg-muted-foreground/10 rounded-2xl" />
                </div>
                {/* Details 4-grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/50 space-y-2.5 shadow-xs">
                            <div className="h-4 w-24 bg-muted-foreground/20 rounded-md" />
                            <div className="h-6 w-3/4 bg-muted-foreground/15 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-m3-error-container/30 border border-m3-error/30 rounded-3xl p-6 sm:p-8 space-y-3 text-center shadow-xs animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-m3-error-container text-m3-on-error-container flex items-center justify-center mx-auto">
                    <MaterialIcon name="error" className="text-[24px] text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Lookup Failed</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{error}</p>
            </div>
        );
    }

    if (!result) return null;

    const { domain, isRegistered, parsed, raw, protocol = "whois", fallbackFromRdap = false, rdapUrl } = result;
    const isRdap = protocol === "rdap";

    const copyToClipboard = () => {
        if (!raw) return;
        navigator.clipboard.writeText(raw);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isRegistered) {
        return (
            <div className="bg-m3-success-container/20 border border-m3-success/30 rounded-3xl p-8 sm:p-10 text-center space-y-6 animate-fade-in relative overflow-hidden shadow-elevation-1 transition-all duration-300">
                <div className="h-16 w-16 rounded-full bg-m3-success-container text-m3-on-success-container flex items-center justify-center mx-auto border border-m3-success/30 shadow-xs">
                    <MaterialIcon name="verified_user" className="text-[32px] text-m3-success" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2.5 flex-wrap">
                        <h3 className="text-3xl font-mono font-extrabold tracking-tight text-m3-success">
                            {domain}
                        </h3>
                        <Badge variant="success" className="text-xs px-3 py-0.5 rounded-full font-mono">
                            {isRdap ? '⚡ RDAP' : '📜 WHOIS'}
                        </Badge>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        Domain is Available!
                    </p>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        This domain name is currently unregistered ({isRdap ? 'Verified via RESTful RDAP protocol 404' : 'Verified via WHOIS lookup'}). You can register it at any major domain registrar.
                    </p>
                </div>

                <div className="pt-2">
                    <a
                        href={`https://www.domainesia.com/domain/?domain=${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-8 py-3 rounded-full hover:shadow-elevation-2 active:shadow-elevation-1 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 cursor-pointer shadow-elevation-1"
                    >
                        <span>Register Domain</span>
                        <MaterialIcon name="open_in_new" className="text-[18px]" />
                    </a>
                </div>
            </div>
        );
    }

    // Days remaining calculations
    const expiryDate = parsed.expiryDate ? new Date(parsed.expiryDate) : null;
    const isDateValid = expiryDate && !isNaN(expiryDate.getTime());
    let daysRemaining = null;
    if (isDateValid) {
        const today = new Date();
        const diffTime = expiryDate!.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    function createGoogleCalendarUrl(domainName: string, expiryDateStr: string | null, registrar?: string): string {
        let datesParam = '';

        if (expiryDateStr) {
            const d = new Date(expiryDateStr);
            if (!isNaN(d.getTime())) {
                // Set reminder reference 30 days before expiration date
                const reminderRef = new Date(d.getTime() - 30 * 24 * 60 * 60 * 1000);

                // Get year, month, day in Asia/Jakarta (GMT+7) timezone
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Asia/Jakarta',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                const parts = formatter.formatToParts(reminderRef);
                const year = Number(parts.find(p => p.type === 'year')?.value);
                const month = Number(parts.find(p => p.type === 'month')?.value);
                const day = Number(parts.find(p => p.type === 'day')?.value);

                // 09:00 AM Jakarta (GMT+7) = 02:00:00 UTC
                const startDate = new Date(Date.UTC(year, month - 1, day, 2, 0, 0));
                // 10:00 AM Jakarta (GMT+7) = 03:00:00 UTC (1 hour duration)
                const endDate = new Date(Date.UTC(year, month - 1, day, 3, 0, 0));

                const startStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                datesParam = `${startStr}/${endStr}`;
            }
        }

        const title = `${domainName} Expiration Reminder (30 Days Before)`;
        let details = `Reminder: Domain ${domainName} is scheduled to expire on ${expiryDateStr || 'the expiry date'} (in 30 days).\nScheduled for 09:00 AM WIB (GMT+7).`;
        if (registrar) {
            details += `\nRegistrar: ${registrar}`;
        }

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            details: details,
        });

        if (datesParam) {
            params.append('dates', datesParam);
        }

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Registered Domain Status Hero Card */}
            <div className="bg-surface-container-high border border-outline-variant/60 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-elevation-1 transition-all duration-300">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground">{domain}</h3>
                        <Badge variant="tertiary" className="rounded-full px-3 py-1 font-semibold text-xs">
                            Registered
                        </Badge>
                        <Badge
                            variant="secondary"
                            className="text-xs px-3 py-1 font-mono rounded-full border border-outline-variant/40"
                        >
                            {isRdap ? '⚡ RDAP' : '📜 WHOIS (Port 43)'}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Managed by <strong className="font-semibold text-foreground">{parsed.registrar || "Unknown Registrar"}</strong>
                        {fallbackFromRdap && (
                            <span className="text-xs font-mono bg-m3-tertiary-container text-m3-on-tertiary-container px-2 py-0.5 rounded-full border border-m3-tertiary/20">
                                RDAP fallback
                            </span>
                        )}
                    </p>
                </div>

                {daysRemaining !== null && (
                    <div className="flex flex-col items-start md:items-end justify-center bg-surface-container-low/80 dark:bg-surface-container p-4 rounded-2xl">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                            Time to Expiry
                        </div>

                        <div className="flex items-center gap-2.5 mt-1">
                            {isDateValid && (
                                <div className="order-2 md:order-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={createGoogleCalendarUrl(domain, parsed.expiryDate, parsed.registrar)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 cursor-pointer shadow-xs"
                                                    aria-label={`Add ${domain} 30-day expiration reminder to Google Calendar`}
                                                >
                                                    <MaterialIcon name="event" className="text-[16px]" />
                                                    <span>Remind Me</span>
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>Add 30-day expiry reminder for {domain} to Google Calendar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            )}
                            <div className={`text-xl font-bold font-mono order-1 md:order-2 ${daysRemaining < 90 ? 'text-destructive font-black' : 'text-primary'}`}>
                                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-normal mt-1">
                            Expires on {formatDate(parsed.expiryDate)}
                        </div>
                    </div>
                )}
            </div>

            {/* M3 Segmented Navigation Tabs */}
            <div className="flex border-b border-outline-variant/50 gap-6">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`pb-3 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] relative cursor-pointer ${
                        activeTab === 'summary'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <MaterialIcon name="description" className="text-[18px]" /> Structured Summary
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('raw')}
                    className={`pb-3 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] relative cursor-pointer ${
                        activeTab === 'raw'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <MaterialIcon name="terminal" className="text-[18px]" /> {isRdap ? 'Raw RDAP JSON' : 'Raw WHOIS Record'}
                    </span>
                </button>
            </div>

            {/* Summary View */}
            {activeTab === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {/* Dates Card */}
                    <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 space-y-4 shadow-xs">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <MaterialIcon name="event" className="text-[18px] text-primary" /> Important Dates
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div className="text-muted-foreground font-medium">Registered:</div>
                            <div className="font-semibold text-foreground">{formatDate(parsed.createdDate)}</div>

                            <div className="text-muted-foreground font-medium">Expires:</div>
                            <div className="font-semibold text-foreground">{formatDate(parsed.expiryDate)}</div>

                            <div className="text-muted-foreground font-medium">Last Updated:</div>
                            <div className="font-semibold text-foreground">{formatDate(parsed.updatedDate)}</div>
                        </div>
                    </div>

                    {/* Registry Operator/Details Card */}
                    <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 space-y-4 shadow-xs">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <MaterialIcon name="language" className="text-[18px] text-primary" /> Registrar &amp; Domain Status
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                            <div className="text-muted-foreground font-medium">Registrar:</div>
                            <div className="font-semibold text-foreground truncate" title={parsed.registrar || "N/A"}>
                                {parsed.registrar || "N/A"}
                            </div>

                            <div className="text-muted-foreground font-medium">Domain Status:</div>
                            <div className="font-medium text-foreground space-y-1">
                                {parsed.status && parsed.status.length > 0 ? (
                                    parsed.status.slice(0, 3).map((st: string, idx: number) => {
                                        const cleanSt = st.split(' ')[0] || st;
                                        return (
                                            <Badge key={idx} variant="outline" className="text-[10px] py-0.5 px-2 rounded-md border-outline-variant/60 capitalize block w-fit truncate" title={st}>
                                                {cleanSt.toLowerCase()}
                                            </Badge>
                                        );
                                    })
                                ) : (
                                    <span>N/A</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RDAP Entities Card if present */}
                    {parsed.entities && parsed.entities.length > 0 && (
                        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 space-y-3.5 md:col-span-2 shadow-xs">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <MaterialIcon name="auto_awesome" className="text-[18px] text-primary" /> RDAP Contact Entities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {parsed.entities.map((ent: { role: string; name: string }, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="font-mono text-xs px-3 py-1 rounded-full border border-outline-variant/40 flex items-center gap-1.5">
                                        <span className="text-primary font-bold uppercase text-[10px]">{ent.role}:</span>
                                        <span>{ent.name}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Name Servers Card */}
                    {parsed.nameServers && parsed.nameServers.length > 0 && (
                        <div className="bg-surface-container-low border border-outline-variant/60 rounded-2xl p-5 space-y-3.5 md:col-span-2 shadow-xs">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <MaterialIcon name="language" className="text-[18px] text-primary" /> DNS Nameservers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {parsed.nameServers.map((ns: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="font-mono text-xs px-3 py-1 rounded-lg bg-surface-container-high text-foreground border border-outline-variant/40">
                                        {ns.toLowerCase()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Raw Terminal / JSON View */}
            {activeTab === 'raw' && (
                <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">
                            {isRdap ? 'RESTful RDAP JSON payload' : 'whois -h query output'}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="rounded-full text-xs h-8 gap-1.5 border-outline-variant/60 bg-surface-container-low transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <MaterialIcon name="check" className="text-[16px] text-m3-success" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <MaterialIcon name="content_copy" className="text-[16px]" />
                                    <span>Copy Record</span>
                                </>
                            )}
                        </Button>
                    </div>
                    <pre className="bg-surface-container-lowest dark:bg-black/80 text-foreground border border-outline-variant/60 rounded-2xl p-5 font-mono text-xs leading-relaxed overflow-x-auto overflow-y-auto max-h-[450px] shadow-elevation-1 custom-scrollbar">
                        {raw || "No raw lookup records found."}
                    </pre>
                </div>
            )}
        </div>
    );
}

export function TldList({
    results,
    query,
    isLoading,
    isWhoisMode = false,
    whoisResult = null,
    whoisError = null
}: TldListProps) {
    const [aiInfo, setAiInfo] = useState<{ [key: string]: { text: string, loading: boolean } }>({});
    const [visibleTlds, setVisibleTlds] = useState<TLD[]>([]);
    const [itemsToLoad, setItemsToLoad] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [allItemsLoaded, setAllItemsLoaded] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const getBadgeStyles = (type: string) => {
        switch (type.toLowerCase()) {
            case 'country-code':
                return 'bg-m3-success-container text-m3-on-success-container border-m3-success/20';
            case 'generic':
                return 'bg-secondary text-secondary-foreground border-outline-variant/40';
            case 'sponsored':
                return 'bg-m3-tertiary-container text-m3-on-tertiary-container border-m3-tertiary/20';
            default:
                return 'bg-secondary text-secondary-foreground border-outline-variant/40';
        }
    };

    const handleAIQuery = async (tldManager: string, domain: string, type: string) => {
        if (aiInfo[tldManager] && !aiInfo[tldManager].loading) return;
        setAiInfo(prev => ({ ...prev, [tldManager]: { text: '', loading: true } }));

        try {
            const response = await fetch('/api/ai-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tldManager, domain, type }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch AI info');
            }

            const data = await response.json();
            setAiInfo(prev => ({ ...prev, [tldManager]: { text: data.aiInfo, loading: false } }));
        } catch (error) {
            console.error("Error fetching AI info:", error);
            setAiInfo(prev => ({ ...prev, [tldManager]: { text: "Error fetching information", loading: false } }));
        }
    };

    const loadMoreCallback = useCallback(() => {
        if (visibleTlds.length >= results.length) {
            setAllItemsLoaded(true);
            return;
        }
        setIsLoadingMore(true);
        setTimeout(() => {
            const newItemsToLoad = Math.min(itemsToLoad + 10, results.length);
            setVisibleTlds(results.slice(0, newItemsToLoad));
            setItemsToLoad(newItemsToLoad);
            setIsLoadingMore(false);
        }, 500);
    }, [itemsToLoad, results, visibleTlds]);

    useEffect(() => {
        setVisibleTlds(results.slice(0, 10));
        setItemsToLoad(10);
        setAllItemsLoaded(false);
    }, [results, query]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 0.1
        };

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoadingMore && !allItemsLoaded) {
                loadMoreCallback();
            }
        };

        observer.current = new IntersectionObserver(handleIntersect, options);

        if (loadMoreRef.current) {
            observer.current.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current && observer.current) {
                observer.current.unobserve(loadMoreRef.current);
            }
        };
    }, [loadMoreCallback, isLoadingMore, allItemsLoaded]);

    if (isWhoisMode) {
        return (
            <WhoisDisplay
                result={whoisResult}
                error={whoisError}
                isLoading={isLoading}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                    <TldSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!results.length) {
        const cleanQuery = query.trim();
        const hasDot = cleanQuery.includes('.');
        return (
            <div className="text-center text-muted-foreground py-10 space-y-4 max-w-md mx-auto animate-fade-in bg-surface-container-low rounded-3xl p-8 border border-outline-variant/40">
                <p className="text-lg font-bold text-foreground">No results found</p>
                {cleanQuery ? (
                    <>
                        <p className="text-sm leading-relaxed">
                            No top-level domain extensions or managers match <span className="font-mono text-foreground font-semibold">"{cleanQuery}"</span>.
                        </p>
                        {!hasDot && (
                            <div className="text-xs border rounded-2xl p-4 bg-surface-container-high border-outline-variant/60 text-left leading-relaxed">
                                <span className="font-bold text-primary">💡 Hint:</span> To perform a live WHOIS lookup on a domain name, make sure to type the full domain including its extension (for example, search <span className="font-mono text-foreground font-semibold">google.com</span> instead of just <span className="font-mono text-foreground font-semibold">google</span>).
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm">Try adjusting your search filters.</p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleTlds.map((tld) => {
                const cleanDomain = tld.domain.toLowerCase().replace(/^\./, '');
                return (
                    <div
                        key={tld.domain}
                        className="m3-card-interactive bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 hover:border-outline-variant rounded-2xl p-5 space-y-3 group flex flex-col justify-between shadow-xs hover:shadow-elevation-1"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <Link 
                                    href={`/tld/${cleanDomain}`}
                                    className="text-xl font-mono font-bold text-foreground hover:text-primary transition-colors duration-200 ease-m3-standard flex items-center gap-1"
                                >
                                    <span>{tld.domain}</span>
                                </Link>
                                <Badge
                                    variant="outline"
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeStyles(tld.type)}`}
                                >
                                    {tld.type}
                                </Badge>
                            </div>
                            <Link
                                href={`/tld/${cleanDomain}`}
                                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 -mr-1 rounded-full text-xs font-semibold text-primary hover:bg-primary/10 transition-all duration-200 ease-m3-standard group/btn active:scale-95 no-underline flex-shrink-0"
                            >
                                <span>Details</span>
                                <MaterialIcon name="arrow_forward" className="text-[16px] transition-transform duration-200 ease-m3-standard group-hover/btn:translate-x-0.5" />
                            </Link>
                        </div>

                        <div className="flex items-center justify-between min-h-8 pt-2 pb-0.5 border-t border-outline-variant/30">
                            <div className="flex items-center min-w-0 flex-1 pr-2">
                                <span
                                    className={`text-sm block truncate leading-normal pr-1 ${
                                        tld.tldManager === "Not assigned"
                                            ? "italic text-muted-foreground/75"
                                            : "text-muted-foreground"
                                    }`}
                                    title={tld.tldManager}
                                >
                                    {tld.tldManager}
                                </span>
                            </div>
                            {tld.tldManager !== "Not assigned" ? (
                                <AiRegistryPopover
                                    tldManager={tld.tldManager}
                                    domain={tld.domain}
                                    type={tld.type}
                                    aiData={aiInfo[tld.tldManager]}
                                    onFetch={handleAIQuery}
                                    triggerClassName="-mr-1"
                                />
                            ) : (
                                <span className="h-7 w-7 -mr-1 shrink-0 pointer-events-none" aria-hidden="true" />
                            )}
                        </div>
                    </div>
                );
            })}
            {!allItemsLoaded && isLoadingMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                    {[...Array(4)].map((_, i) => (
                        <TldSkeleton key={i} />
                    ))}
                </div>
            )}
            <div ref={loadMoreRef} className="col-span-1 md:col-span-2"></div>
        </div>
    );
}


