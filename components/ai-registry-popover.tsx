"use client"

import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/ui/popover";
import { MaterialIcon } from "@/components/ui/material-icon";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Badge } from "@/components/ui/badge";

interface AiRegistryPopoverProps {
    tldManager: string;
    domain: string;
    type: string;
    aiData?: { text: string; loading: boolean; model?: string; error?: string | null };
    onFetch?: (tldManager: string, domain: string, type: string) => void;
    triggerClassName?: string;
    triggerSize?: "sm" | "md" | "lg";
}

export function AiRegistryPopover({
    tldManager,
    domain,
    type,
    aiData,
    onFetch,
    triggerClassName = "",
    triggerSize = "sm"
}: AiRegistryPopoverProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [localData, setLocalData] = useState<{ text: string; loading: boolean; model?: string; error?: string | null }>({
        text: '',
        loading: false,
        model: undefined,
        error: null
    });

    const data = aiData || localData;
    const cleanDomain = domain.toLowerCase().replace(/^\./, '');

    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            if (onFetch) {
                onFetch(tldManager, domain, type);
            } else if (!data.text && !data.loading) {
                setLocalData({ text: '', loading: true, error: null });
                try {
                    const res = await fetch('/api/ai-info', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tldManager, domain, type }),
                    });
                    if (!res.ok) {
                        throw new Error('Failed to fetch AI insights');
                    }
                    const json = await res.json();
                    setLocalData({
                        text: json.aiInfo,
                        loading: false,
                        model: json.model,
                        error: null
                    });
                } catch (err: any) {
                    setLocalData({
                        text: '',
                        loading: false,
                        error: err?.message || 'Unable to retrieve AI information at this time.'
                    });
                }
            }
        }
    };

    const handleRetry = () => {
        if (onFetch) {
            onFetch(tldManager, domain, type);
        } else {
            handleOpenChange(true);
        }
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!data.text) return;
        navigator.clipboard.writeText(data.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sizeClasses = {
        sm: "h-7 w-7 p-1 text-amber-500 hover:bg-amber-500/10 active:scale-90",
        md: "h-8 w-8 p-1.5 text-amber-500 hover:bg-amber-500/10 active:scale-90",
        lg: "h-9 w-9 p-2 text-amber-500 hover:bg-amber-500/10 active:scale-90",
    }[triggerSize];

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={`Get Gemini AI Registry Insights for .${cleanDomain}`}
                    title="Get Gemini AI Registry Insights"
                    className={`inline-flex items-center justify-center rounded-full transition-all duration-200 ease-m3-standard cursor-pointer flex-shrink-0 ${sizeClasses} ${triggerClassName}`}
                >
                    <MaterialIcon name="auto_awesome" className="text-[18px]" />
                </button>
            </PopoverTrigger>

            <PopoverContent
                side="top"
                align="center"
                sideOffset={10}
                collisionPadding={16}
                className="w-[calc(100vw-2rem)] sm:w-[390px] max-w-[420px] p-0 rounded-3xl bg-surface-container-high dark:bg-surface-container-highest shadow-elevation-3 backdrop-blur-xl text-foreground overflow-hidden"
            >
                {/* Material Design 3 Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-container-highest/60 bg-surface-container/70 dark:bg-surface-container/40">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="h-8 w-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                            <MaterialIcon name="auto_awesome" className="text-[18px]" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-foreground tracking-tight truncate">
                                    Registry Insights
                                </h4>
                                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                    .{cleanDomain}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate font-normal" title={tldManager}>
                                {tldManager}
                            </p>
                        </div>
                    </div>

                    <PopoverClose
                        className="h-8 w-8 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all duration-150 active:scale-90 cursor-pointer shrink-0"
                        aria-label="Close popover"
                    >
                        <MaterialIcon name="close" className="text-[18px]" />
                    </PopoverClose>
                </div>

                {/* Material Design 3 Body */}
                <div className="p-5 max-h-[320px] overflow-y-auto custom-scrollbar">
                    {data.loading ? (
                        <div className="space-y-3.5 py-2">
                            {/* M3 Indeterminate Progress Bar */}
                            <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full animate-[pulse_1.2s_ease-in-out_infinite] w-2/3" />
                            </div>
                            <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium pt-1">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />
                                <span>Generating AI overview for {tldManager}...</span>
                            </div>
                            <div className="space-y-2 pt-2 animate-pulse opacity-60">
                                <div className="h-3.5 bg-muted-foreground/20 rounded-md w-full" />
                                <div className="h-3.5 bg-muted-foreground/20 rounded-md w-11/12" />
                                <div className="h-3.5 bg-muted-foreground/20 rounded-md w-3/4" />
                            </div>
                        </div>
                    ) : data.error ? (
                        <div className="bg-m3-error-container/30 rounded-2xl p-4 space-y-3 text-m3-on-error-container">
                            <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                                <MaterialIcon name="error" className="text-[18px]" />
                                <span>Could not load insights</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {data.error}
                            </p>
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-highest text-foreground transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                            >
                                <MaterialIcon name="refresh" className="text-[14px]" />
                                <span>Retry</span>
                            </button>
                        </div>
                    ) : data.text ? (
                        <MarkdownRenderer content={data.text} />
                    ) : (
                        <div className="text-xs text-muted-foreground text-center py-4">
                            No overview available for this manager.
                        </div>
                    )}
                </div>

                {/* Material Design 3 Footer */}
                {data.text && !data.loading && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-surface-container-highest/60 bg-surface-container/40 dark:bg-surface-container/20">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <MaterialIcon name="auto_awesome" className="text-[14px] text-amber-500" />
                            <span>Powered by Gemini AI</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-surface-container-highest hover:bg-surface-container-highest/80 text-foreground transition-all duration-150 active:scale-95 cursor-pointer shadow-xs"
                            title="Copy overview text"
                        >
                            {copied ? (
                                <>
                                    <MaterialIcon name="check" className="text-[15px] text-primary" />
                                    <span className="text-primary font-semibold">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <MaterialIcon name="content_copy" className="text-[15px]" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
