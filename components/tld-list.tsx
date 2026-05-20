import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles } from 'lucide-react';
import type { TLD } from "@/data/tlds";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";

interface TldListProps {
    results: TLD[];
    query: string;
    isLoading: boolean;
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

export function TldList({ results, query, isLoading }: TldListProps) {
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
        return (
            <div className="text-center text-muted-foreground">
                No results found. Try adjusting your search criteria.
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {visibleTlds.map((tld) => (
                    <div
                        key={tld.domain}
                        className="bg-muted/50 rounded-lg p-4 space-y-2"
                    >
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-mono">{tld.domain}</h3>
                            <Badge
                                variant="secondary"
                                className={getBadgeStyles(tld.type)}
                            >
                                {tld.type}
                            </Badge>
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
                                                <Sparkles className="h-4 w-4" />
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
                ))}
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

