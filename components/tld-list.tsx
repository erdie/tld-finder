import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Calendar, ShieldCheck, Globe, Terminal, Copy, FileText, Check, AlertTriangle, ExternalLink, ChevronRight } from 'lucide-react';
import type { TLD } from "@/data/tlds";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";

interface TldListProps {
    results: TLD[];
    query: string;
    isLoading: boolean;
    isWhoisMode?: boolean;
    whoisResult?: any;
    whoisError?: string | null;
}

function renderMarkdown(text: string): ReactNode {
    if (!text) return null;

    // Pattern to capture links [text](url), bold **text**, and italic *text*
    const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={index} className="italic text-muted-foreground">{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                    const match = part.match(/\[(.*?)\]\((.*?)\)/);
                    if (match) {
                        const [, linkText, url] = match;
                        let safeUrl = url;
                        if (!/^https?:\/\//i.test(url)) {
                            safeUrl = `https://${url}`;
                        }
                        return (
                            <a
                                key={index}
                                href={safeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-400 underline font-semibold inline-flex items-center gap-0.5"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {linkText}
                            </a>
                        );
                    }
                }
                return part;
            })}
        </span>
    );
}

const TldSkeleton = () => (
    <div className="animate-pulse bg-muted rounded-lg p-4 space-y-2">
        <div className="h-5 bg-muted-foreground/20 rounded w-1/4"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
    </div>
);

function WhoisDisplay({ result, error, isLoading }: { result: any; error: string | null; isLoading: boolean }) {
    const [activeTab, setActiveTab] = useState<'summary' | 'raw'>('summary');
    const [copied, setCopied] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Status card skeleton */}
                <div className="bg-muted/40 rounded-md p-6 border border-muted/60 space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                {/* Details grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-md p-4 h-24 border border-muted/40"></div>
                    <div className="bg-muted/30 rounded-md p-4 h-24 border border-muted/40"></div>
                    <div className="bg-muted/30 rounded-md p-4 h-24 border border-muted/40"></div>
                    <div className="bg-muted/30 rounded-md p-4 h-24 border border-muted/40"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-6 space-y-4 text-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-semibold text-red-400">Lookup Failed</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">{error}</p>
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
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-8 text-center space-y-6 animate-fade-in relative overflow-hidden group shadow-lg shadow-emerald-500/5">
                {/* Pulsing visual element */}
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
                <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />

                <div className="bg-emerald-500/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30 shadow-md">
                    <ShieldCheck className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-2xl font-mono font-bold tracking-tight text-emerald-400">
                            {domain}
                        </h3>
                        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${isRdap ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                            {isRdap ? '⚡ RDAP' : '📜 WHOIS'}
                        </Badge>
                    </div>
                    <p className="text-xl font-light text-foreground">
                        Domain is Available!
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        This domain name is currently unregistered ({isRdap ? 'Verified via RESTful RDAP protocol 404' : 'Verified via WHOIS lookup'}). You can register it at any major domain registrar.
                    </p>
                </div>

                <div className="pt-2">
                    <a
                        href={`https://www.domainesia.com/domain/?domain=${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-md shadow-emerald-700/20 cursor-pointer"
                    >
                        Register Domain <ExternalLink className="h-4 w-4" />
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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Registered Domain Status Card */}
            <div className="bg-muted/30 border rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group shadow-xs">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-2xl font-mono font-bold tracking-tight">{domain}</h3>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">
                            Registered
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`text-xs px-2 py-0.5 font-mono ${
                                isRdap
                                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-semibold'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                        >
                            {isRdap ? '⚡ Protocol: RDAP (RESTful JSON)' : '📜 Protocol: WHOIS (Port 43)'}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-light flex items-center gap-2">
                        Managed by <span className="font-semibold text-foreground">{parsed.registrar || "Unknown Registrar"}</span>
                        {fallbackFromRdap && (
                            <span className="text-xs text-amber-400/90 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                RDAP fallback
                            </span>
                        )}
                    </p>
                </div>

                {daysRemaining !== null && (
                    <div className="flex flex-col items-start md:items-end justify-center">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            Time to Expiry
                        </div>
                        <div className={`text-xl font-bold font-mono ${daysRemaining < 90 ? 'text-rose-500' : 'text-blue-400'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                        </div>
                        <div className="text-xs text-muted-foreground font-light mt-0.5">
                            Expires on {formatDate(parsed.expiryDate)}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b gap-4">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`pb-2 text-sm font-semibold transition relative cursor-pointer ${
                        activeTab === 'summary'
                            ? 'text-foreground border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" /> Structured Summary
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('raw')}
                    className={`pb-2 text-sm font-semibold transition relative cursor-pointer ${
                        activeTab === 'raw'
                            ? 'text-foreground border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <Terminal className="h-4 w-4" /> {isRdap ? 'Raw RDAP JSON' : 'Raw WHOIS Record'}
                    </span>
                </button>
            </div>

            {/* Summary View */}
            {activeTab === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {/* Dates Card */}
                    <div className="bg-muted/30 border rounded-md p-4 space-y-3.5">
                        <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" /> Important Dates
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs font-light">
                            <div className="text-muted-foreground">Registered:</div>
                            <div className="font-medium text-foreground">{formatDate(parsed.createdDate)}</div>

                            <div className="text-muted-foreground">Expires:</div>
                            <div className="font-medium text-foreground">{formatDate(parsed.expiryDate)}</div>

                            <div className="text-muted-foreground">Last Updated:</div>
                            <div className="font-medium text-foreground">{formatDate(parsed.updatedDate)}</div>
                        </div>
                    </div>

                    {/* Registry Operator/Details Card */}
                    <div className="bg-muted/30 border rounded-md p-4 space-y-3.5">
                        <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                            <Globe className="h-4 w-4 text-purple-500" /> Registrar & Domain Status
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs font-light">
                            <div className="text-muted-foreground">Registrar:</div>
                            <div className="font-medium text-foreground truncate" title={parsed.registrar || "N/A"}>
                                {parsed.registrar || "N/A"}
                            </div>

                            <div className="text-muted-foreground">Domain Status:</div>
                            <div className="font-medium text-foreground space-y-1">
                                {parsed.status && parsed.status.length > 0 ? (
                                    parsed.status.slice(0, 3).map((st: string, idx: number) => {
                                        const cleanSt = st.split(' ')[0] || st;
                                        return (
                                            <Badge key={idx} variant="outline" className="text-[10px] py-0 px-1 border-muted-foreground/30 capitalize block w-fit truncate" title={st}>
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
                        <div className="bg-muted/30 border rounded-md p-4 space-y-3.5 md:col-span-2">
                            <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-400" /> RDAP Contact Entities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {parsed.entities.map((ent: { role: string; name: string }, idx: number) => (
                                    <Badge key={idx} variant="outline" className="font-mono text-xs px-2.5 py-1 bg-purple-500/5 text-foreground border-purple-500/20 flex items-center gap-1.5">
                                        <span className="text-purple-400 font-bold uppercase text-[10px]">{ent.role}:</span>
                                        <span>{ent.name}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Name Servers Card */}
                    {parsed.nameServers && parsed.nameServers.length > 0 && (
                        <div className="bg-muted/30 border rounded-md p-4 space-y-3.5 md:col-span-2">
                            <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <Globe className="h-4 w-4 text-emerald-500" /> DNS Nameservers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {parsed.nameServers.map((ns: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-muted/80 text-muted-foreground hover:text-foreground border">
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
                <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono">
                            {isRdap ? 'RESTful RDAP JSON payload' : 'whois -h query output'}
                        </span>
                        <button
                            onClick={copyToClipboard}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition bg-muted/60 border hover:bg-muted py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" /> Copy Record
                                </>
                            )}
                        </button>
                    </div>
                    <pre className="bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-md p-4 font-mono text-xs leading-relaxed overflow-x-auto overflow-y-auto max-h-[450px] shadow-inner custom-scrollbar selection:bg-neutral-700">
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
    const [openTooltip, setOpenTooltip] = useState<string | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const getBadgeStyles = (type: string) => {
        switch (type.toLowerCase()) {
            case 'country-code':
                return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
            case 'generic':
                return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
            case 'sponsored':
                return 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30';
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

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const clickedTrigger = target.closest('[data-tooltip-trigger="true"]');
            const clickedContent = target.closest('[data-radix-popper-content-wrapper]');

            if (!clickedTrigger && !clickedContent) {
                setOpenTooltip(null);
            }
        };

        if (openTooltip) {
            document.addEventListener("click", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("click", handleOutsideClick);
        };
    }, [openTooltip]);

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
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <TldSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!results.length) {
        const cleanQuery = query.trim();
        const hasDot = cleanQuery.includes('.');
        return (
            <div className="text-center text-muted-foreground py-8 space-y-4 max-w-md mx-auto animate-fade-in">
                <p className="text-lg font-light text-foreground">No results found</p>
                {cleanQuery ? (
                    <>
                        <p className="text-sm font-light leading-relaxed">
                            No top-level domain extensions or managers match <span className="font-mono text-foreground font-medium">"{cleanQuery}"</span>.
                        </p>
                        {!hasDot && (
                            <div className="text-xs border rounded-lg p-3 bg-muted/20 border-muted/30 text-left leading-relaxed">
                                <span className="font-bold text-foreground">💡 Hint:</span> To perform a live WHOIS lookup on a domain name, make sure to type the full domain including its extension (for example, search <span className="font-mono text-foreground font-semibold">google.com</span> instead of just <span className="font-mono text-foreground font-semibold">google</span>).
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-sm font-light">Try adjusting your search filters.</p>
                )}
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {visibleTlds.map((tld) => {
                    const cleanDomain = tld.domain.toLowerCase().replace(/^\./, '');
                    return (
                        <div
                            key={tld.domain}
                            className="bg-muted/50 hover:bg-muted/70 transition-colors border border-border/40 rounded-lg p-4 space-y-2 group"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Link 
                                        href={`/tld/${cleanDomain}`}
                                        className="text-lg font-mono font-bold hover:text-blue-400 hover:underline transition-colors flex items-center gap-1"
                                    >
                                        <span>{tld.domain}</span>
                                    </Link>
                                    <Badge
                                        variant="secondary"
                                        className={getBadgeStyles(tld.type)}
                                    >
                                        {tld.type}
                                    </Badge>
                                </div>
                                <Link
                                    href={`/tld/${cleanDomain}`}
                                    className="text-xs font-medium text-blue-500 hover:text-blue-400 opacity-80 group-hover:opacity-100 transition-all flex items-center gap-0.5"
                                >
                                    <span>Record Details</span>
                                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground flex gap-2 items-center">
                                    {tld.tldManager}
                                    {tld.tldManager !== "Not assigned" && (
                                        <Tooltip open={openTooltip === tld.domain}>
                                            <TooltipTrigger asChild>
                                                <span
                                                    data-tooltip-trigger="true"
                                                    onClick={() => {
                                                        if (openTooltip === tld.domain) {
                                                            setOpenTooltip(null);
                                                        } else {
                                                            setOpenTooltip(tld.domain);
                                                            handleAIQuery(tld.tldManager, tld.domain, tld.type);
                                                        }
                                                    }}
                                                    className="cursor-pointer hover:opacity-80 transition duration-300"
                                                >
                                                    <Sparkles className="h-4 w-4 text-amber-400" />
                                                    <span className="sr-only">Get AI Info</span>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[320px] p-3 text-xs leading-relaxed break-words">
                                                {aiInfo[tld.tldManager]?.loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                        <span>Analyzing registry details...</span>
                                                    </div>
                                                ) : (
                                                    aiInfo[tld.tldManager]?.text ? renderMarkdown(aiInfo[tld.tldManager].text) : "No information available."
                                                )}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {!allItemsLoaded && isLoadingMore && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <TldSkeleton key={i} />
                        ))}
                    </div>
                )}
                <div ref={loadMoreRef}></div>
            </div>
        </TooltipProvider>
    );
}
