"use client"

import React, { useState } from "react";
import type { DomainHack } from "@/lib/domain-hacks";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";

interface DomainHacksProps {
    hacks: DomainHack[];
    query: string;
    onSelectHack: (domain: string) => void;
    isLoading?: boolean;
}

export function DomainHacksSkeleton() {
    return (
        <div className="bg-surface-container-low rounded-3xl p-6 shadow-elevation-1 space-y-5 animate-pulse transition-all duration-300">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-container-highest/60">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-muted-foreground/15 shrink-0" />
                    <div className="space-y-2">
                        <div className="h-5 w-36 bg-muted-foreground/20 rounded-md" />
                        <div className="h-3.5 w-52 bg-muted-foreground/15 rounded-md" />
                    </div>
                </div>
                {/* Filter Chips Skeleton */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="h-7 w-16 bg-muted-foreground/15 rounded-full" />
                    <div className="h-7 w-20 bg-muted-foreground/15 rounded-full" />
                    <div className="h-7 w-18 bg-muted-foreground/15 rounded-full" />
                </div>
            </div>

            {/* Hacks Cards Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-surface-container rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-xs"
                    >
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="h-5 w-28 bg-muted-foreground/20 rounded-md" />
                                <div className="h-4 w-12 bg-muted-foreground/15 rounded-full" />
                            </div>
                            <div className="h-3.5 w-3/4 bg-muted-foreground/15 rounded-md" />
                        </div>
                        <div className="pt-3 border-t border-surface-container-highest/60 flex items-center justify-between gap-2">
                            <div className="h-6 w-24 bg-muted-foreground/15 rounded-full" />
                            <div className="h-6 w-14 bg-muted-foreground/10 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DomainHacks({ hacks, query, onSelectHack, isLoading = false }: DomainHacksProps) {
    const [filterType, setFilterType] = useState<"all" | "direct" | "path" | "subdomain">("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (isLoading) {
        return <DomainHacksSkeleton />;
    }

    if (!hacks || hacks.length === 0) return null;

    const filteredHacks = filterType === "all"
        ? hacks
        : hacks.filter(h => h.type === filterType);

    const directCount = hacks.filter(h => h.type === "direct").length;
    const pathCount = hacks.filter(h => h.type === "path").length;
    const subCount = hacks.filter(h => h.type === "subdomain").length;

    const handleCopy = (e: React.MouseEvent, hack: DomainHack) => {
        e.stopPropagation();
        navigator.clipboard.writeText(hack.full);
        setCopiedId(hack.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="bg-surface-container-low rounded-3xl p-6 shadow-elevation-1 space-y-5 animate-fade-in transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-container-highest/60">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <MaterialIcon name="content_cut" className="text-[20px]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                            Domain Hacks
                            <Badge variant="secondary" className="bg-secondary-container text-on-secondary-container text-xs rounded-full px-2.5 py-0.5 font-mono border-none">
                                {hacks.length} {hacks.length === 1 ? 'hack' : 'hacks'}
                            </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Split-word domain name matches for <span className="font-semibold text-foreground font-mono">"{query}"</span>
                        </p>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                            filterType === "all"
                                ? "bg-secondary-container text-on-secondary-container shadow-xs font-semibold"
                                : "bg-surface-container hover:bg-surface-container-high text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setFilterType("all")}
                    >
                        All ({hacks.length})
                    </button>
                    {directCount > 0 && (
                        <button
                            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                filterType === "direct"
                                ? "bg-secondary-container text-on-secondary-container shadow-xs font-semibold"
                                : "bg-surface-container hover:bg-surface-container-high text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setFilterType("direct")}
                        >
                            Direct ({directCount})
                        </button>
                    )}
                    {pathCount > 0 && (
                        <button
                            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                filterType === "path"
                                ? "bg-secondary-container text-on-secondary-container shadow-xs font-semibold"
                                : "bg-surface-container hover:bg-surface-container-high text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setFilterType("path")}
                        >
                            Path ({pathCount})
                        </button>
                    )}
                    {subCount > 0 && (
                        <button
                            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                filterType === "subdomain"
                                ? "bg-secondary-container text-on-secondary-container shadow-xs font-semibold"
                                : "bg-surface-container hover:bg-surface-container-high text-muted-foreground hover:text-foreground"
                            }`}
                            onClick={() => setFilterType("subdomain")}
                        >
                            Subdomain ({subCount})
                        </button>
                    )}
                </div>
            </div>

            {/* Hacks Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredHacks.map((hack) => {
                    const isDirect = hack.type === "direct";
                    const isPath = hack.type === "path";

                    return (
                        <div
                            key={hack.id}
                            className="group relative bg-surface-container hover:bg-surface-container-high rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ease-m3-standard hover:shadow-elevation-1 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer shadow-xs"
                            onClick={() => onSelectHack(hack.domain)}
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                    {/* Styled Domain Hack Display */}
                                    <div className="font-mono text-base font-bold tracking-tight flex items-center flex-wrap">
                                        {hack.sub && (
                                            <span className="text-muted-foreground">{hack.sub}.</span>
                                        )}
                                        <span className="text-foreground">{hack.name}</span>
                                        <span className="text-primary font-extrabold">.{hack.tld}</span>
                                        {hack.path && (
                                            <span className="text-muted-foreground font-normal">/{hack.path}</span>
                                        )}
                                    </div>

                                    {/* Type badge */}
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border-none ${
                                            isDirect
                                                ? "bg-primary-container text-on-primary-container font-bold"
                                                : isPath
                                                ? "bg-secondary-container text-on-secondary-container"
                                                : "bg-tertiary-container text-on-tertiary-container"
                                        }`}
                                    >
                                        {hack.type}
                                    </Badge>
                                </div>

                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span className="capitalize">{hack.tldType} TLD</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[140px]" title={hack.tldManager}>
                                        {hack.tldManager || "IANA Managed"}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 mt-3 border-t border-surface-container-highest/60 flex items-center justify-between gap-2">
                                <button
                                    className="text-xs h-7 text-primary hover:bg-primary/10 rounded-full gap-1.5 px-2.5 font-medium inline-flex items-center cursor-pointer transition-all duration-200 ease-m3-standard active:scale-95 no-underline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectHack(hack.domain);
                                    }}
                                >
                                    <MaterialIcon name="search" className="text-[16px]" />
                                    <span>Check Lookup</span>
                                </button>


                                <div className="flex items-center gap-1">
                                    <button
                                        className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/8 transition-all duration-150 ease-m3-standard active:scale-90 cursor-pointer"
                                        title="Copy domain hack"
                                        onClick={(e) => handleCopy(e, hack)}
                                    >
                                        {copiedId === hack.id ? (
                                            <MaterialIcon name="check" className="text-[16px] text-m3-success" />
                                        ) : (
                                            <MaterialIcon name="content_copy" className="text-[16px]" />
                                        )}
                                    </button>

                                    <a
                                        href={hack.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/8 transition-all duration-150 ease-m3-standard active:scale-90"
                                        title="Open URL"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MaterialIcon name="open_in_new" className="text-[16px]" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
}


