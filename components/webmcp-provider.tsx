"use client";

import { useEffect } from "react";
import { tlds, TLD } from "@/data/tlds";
import { generateDomainHacks } from "@/lib/domain-hacks";

function filterTldsInternal(
    allTlds: TLD[],
    query: string,
    type: string,
    assignment: string
): TLD[] {
    const trimmedQuery = query.trim().toLowerCase();
    return allTlds.filter((tld) => {
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
            matchesQuery =
                tld.domain.toLowerCase().includes(trimmedQuery) ||
                tld.tldManager.toLowerCase().includes(trimmedQuery);
        }

        return matchesType && matchesAssignment && matchesQuery;
    });
}

/**
 * WebMCPProvider
 * Registers WebMCP (Web Model Context Protocol) tools on document.modelContext / navigator.modelContext
 * to enable AI agents and Agentic Browsers (Chrome 150+, Lighthouse Agentic Browsing) to interact
 * directly with TLD Finder via structured JSON-schema tools.
 */
export function WebMCPProvider() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const ctx = (document as any).modelContext || (navigator as any).modelContext;
        if (!ctx || typeof ctx.registerTool !== "function") return;

        try {
            // Tool 1: search_tlds
            ctx.registerTool({
                name: "search_tlds",
                description: "Search and inspect 1,500+ IANA top-level domains (gTLDs, ccTLDs, sTLDs) by extension, registry manager, or keyword.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The TLD extension (e.g. '.com', '.id', '.ai') or registry manager keyword to search for"
                        },
                        type: {
                            type: "string",
                            enum: ["all", "generic", "country-code", "sponsored"],
                            description: "Filter by TLD category (generic, country-code, sponsored, or all)"
                        },
                        assignment: {
                            type: "string",
                            enum: ["all", "assigned", "unassigned"],
                            description: "Filter by delegation status (assigned, unassigned, or all)"
                        }
                    }
                },
                execute: async (args: { query?: string; type?: string; assignment?: string } = {}) => {
                    const { query = "", type = "all", assignment = "all" } = args;
                    const results = filterTldsInternal(tlds, query, type, assignment);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    total: results.length,
                                    results: results.slice(0, 30).map(t => ({
                                        domain: t.domain,
                                        type: t.type,
                                        tldManager: t.tldManager,
                                        url: `https://tld-finder.netlify.app/tld/${t.domain.replace(/^\./, '')}`
                                    }))
                                }, null, 2)
                            }
                        ]
                    };
                }
            });

            // Tool 2: lookup_domain
            ctx.registerTool({
                name: "lookup_domain",
                description: "Perform a live WHOIS & RDAP domain registration status, expiration date, and DNS nameserver query on a domain name.",
                inputSchema: {
                    type: "object",
                    properties: {
                        domain: {
                            type: "string",
                            description: "Full domain name to look up (e.g. 'google.com', 'erdiawan.id', 'openai.ai')"
                        },
                        protocol: {
                            type: "string",
                            enum: ["auto", "rdap", "whois"],
                            description: "Query protocol preference: auto (RDAP preferred), rdap (JSON REST), or whois (Port 43)"
                        }
                    },
                    required: ["domain"]
                },
                execute: async (args: { domain: string; protocol?: "auto" | "rdap" | "whois" }) => {
                    const { domain, protocol = "auto" } = args;
                    try {
                        const res = await fetch(`/api/whois?domain=${encodeURIComponent(domain)}&protocol=${protocol}`);
                        const data = await res.json();
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(data, null, 2)
                                }
                            ]
                        };
                    } catch (err: any) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify({ error: err.message || "Failed to query domain WHOIS/RDAP" }, null, 2)
                                }
                            ],
                            isError: true
                        };
                    }
                }
            });

            // Tool 3: generate_domain_hacks
            ctx.registerTool({
                name: "generate_domain_hacks",
                description: "Generate creative split-word domain hack suggestions for any brand name, word, or keyword.",
                inputSchema: {
                    type: "object",
                    properties: {
                        keyword: {
                            type: "string",
                            description: "Keyword or brand name to split into domain hacks (e.g. 'delicious', 'antigravity', 'photography')"
                        }
                    },
                    required: ["keyword"]
                },
                execute: async (args: { keyword: string }) => {
                    const { keyword } = args;
                    const hacks = generateDomainHacks(keyword);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    keyword,
                                    total: hacks.length,
                                    hacks: hacks.map(h => ({
                                        domain: h.domain,
                                        full: h.full,
                                        url: h.url,
                                        type: h.type,
                                        tld: h.tld
                                    }))
                                }, null, 2)
                            }
                        ]
                    };
                }
            });
        } catch (e) {
            console.warn("WebMCP tool registration error:", e);
        }
    }, []);

    return null;
}
