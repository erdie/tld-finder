"use client"

import React, { useState } from "react";
import type { DomainHack } from "@/lib/domain-hacks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ExternalLink, Search, Copy, Check, Scissors, Layers, Link as LinkIcon } from "lucide-react";

interface DomainHacksProps {
    hacks: DomainHack[];
    query: string;
    onSelectHack: (domain: string) => void;
}

export function DomainHacks({ hacks, query, onSelectHack }: DomainHacksProps) {
    const [filterType, setFilterType] = useState<"all" | "direct" | "path" | "subdomain">("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);

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
        <div className="bg-card border border-primary/20 rounded-xl p-5 shadow-lg space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Scissors className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            Domain Hacks
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                {hacks.length} {hacks.length === 1 ? 'hack' : 'hacks'} found
                            </Badge>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Split-word domain name matches for <span className="font-semibold text-foreground font-mono">"{query}"</span>
                        </p>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                        variant={filterType === "all" ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7 px-2.5 rounded-full cursor-pointer"
                        onClick={() => setFilterType("all")}
                    >
                        All ({hacks.length})
                    </Button>
                    {directCount > 0 && (
                        <Button
                            variant={filterType === "direct" ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-7 px-2.5 rounded-full cursor-pointer"
                            onClick={() => setFilterType("direct")}
                        >
                            Direct ({directCount})
                        </Button>
                    )}
                    {pathCount > 0 && (
                        <Button
                            variant={filterType === "path" ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-7 px-2.5 rounded-full cursor-pointer"
                            onClick={() => setFilterType("path")}
                        >
                            Path ({pathCount})
                        </Button>
                    )}
                    {subCount > 0 && (
                        <Button
                            variant={filterType === "subdomain" ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-7 px-2.5 rounded-full cursor-pointer"
                            onClick={() => setFilterType("subdomain")}
                        >
                            Subdomain ({subCount})
                        </Button>
                    )}
                </div>
            </div>

            {/* Hacks Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredHacks.map((hack) => {
                    const isDirect = hack.type === "direct";
                    const isPath = hack.type === "path";

                    return (
                        <div
                            key={hack.id}
                            className={`group relative border rounded-lg p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer ${
                                isDirect
                                    ? "bg-gradient-to-br from-primary/10 via-card to-card border-primary/40 hover:border-primary"
                                    : "bg-muted/30 border-muted hover:border-muted-foreground/40"
                            }`}
                            onClick={() => onSelectHack(hack.domain)}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    {/* Styled Domain Hack Display */}
                                    <div className="font-mono text-base font-bold tracking-tight flex items-center flex-wrap">
                                        {hack.sub && (
                                            <span className="text-muted-foreground">{hack.sub}.</span>
                                        )}
                                        <span className="text-foreground">{hack.name}</span>
                                        <span className="text-primary font-black">.{hack.tld}</span>
                                        {hack.path && (
                                            <span className="text-muted-foreground font-normal">/{hack.path}</span>
                                        )}
                                    </div>

                                    {/* Type badge */}
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] uppercase font-mono px-1.5 py-0.5 ${
                                            isDirect
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold"
                                                : isPath
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                : "bg-amber-500/10 text-amber-500 border-amber-500/30"
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
                            <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10 gap-1 px-2 font-medium"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectHack(hack.domain);
                                    }}
                                >
                                    <Search className="h-3 w-3" /> Check RDAP/WHOIS
                                </Button>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        title="Copy domain hack"
                                        onClick={(e) => handleCopy(e, hack)}
                                    >
                                        {copiedId === hack.id ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                    </Button>

                                    <a
                                        href={hack.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 text-muted-foreground hover:text-foreground transition rounded"
                                        title="Open URL"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
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
