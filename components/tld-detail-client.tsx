"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WhoisSkeleton } from "@/components/tld-list";

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

interface TldDetailClientProps {
    domain: string;
    whoisServer: string | null;
    rdapServer: string | null;
}

export function TldDetailClient({ domain, whoisServer, rdapServer }: TldDetailClientProps) {
    const [subdomain, setSubdomain] = useState("");
    const [protocol, setProtocol] = useState<"auto" | "rdap" | "whois">("auto");
    const [isLoading, setIsLoading] = useState(false);
    const [whoisResult, setWhoisResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"summary" | "raw">("summary");
    const [copiedRaw, setCopiedRaw] = useState(false);

    const fullDomain = subdomain.trim()
        ? (subdomain.includes('.') ? subdomain : `${subdomain}.${domain}`)
        : `example.${domain}`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const handleCopyRaw = () => {
        if (!whoisResult?.raw) return;
        navigator.clipboard.writeText(whoisResult.raw);
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = subdomain.trim() ? (subdomain.includes('.') ? subdomain : `${subdomain}.${domain}`) : `example.${domain}`;
        
        setIsLoading(true);
        setError(null);
        setWhoisResult(null);

        try {
            const res = await fetch(`/api/whois?domain=${encodeURIComponent(target)}&protocol=${protocol}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.details || "Failed to perform WHOIS lookup");
            }
            setWhoisResult(data);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during domain lookup.");
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="space-y-6">
            {/* M3 Quick Copy Assist Chips Bar */}
            {(whoisServer || rdapServer) && (
                <div className="flex flex-wrap items-center gap-2.5 bg-surface-container-low rounded-2xl p-4 shadow-xs">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1.5">
                        <MaterialIcon name="auto_awesome" className="text-[16px] text-primary" />
                        Quick Copy:
                    </span>
                    {whoisServer && (
                        <button
                            onClick={() => handleCopy(whoisServer)}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-xs font-mono transition-all duration-200 ease-m3-standard active:scale-95 text-foreground cursor-pointer shadow-xs"
                            title="Copy WHOIS Server"
                        >
                            <span>WHOIS: {whoisServer}</span>
                            {copiedText === whoisServer ? <MaterialIcon name="check" className="text-[16px] text-primary" /> : <MaterialIcon name="content_copy" className="text-[16px] text-muted-foreground" />}
                        </button>
                    )}
                    {rdapServer && (
                        <button
                            onClick={() => handleCopy(rdapServer)}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-xs font-mono transition-all duration-200 ease-m3-standard active:scale-95 text-foreground cursor-pointer shadow-xs"
                            title="Copy RDAP Endpoint URL"
                        >
                            <span>RDAP Endpoint</span>
                            {copiedText === rdapServer ? <MaterialIcon name="check" className="text-[16px] text-primary" /> : <MaterialIcon name="content_copy" className="text-[16px] text-muted-foreground" />}
                        </button>
                    )}
                </div>
            )}

            {/* Live Domain Availability & WHOIS Interactive Section - M3 Elevated Card */}
            <div className="bg-surface-container-low rounded-3xl p-6 sm:p-7 shadow-elevation-1 space-y-6 transition-all duration-300 ease-m3-emphasized">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <MaterialIcon name="language" className="text-[20px]" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                Live WHOIS &amp; Availability Checker
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Check real-time registration status or inspect full WHOIS &amp; RDAP records for any <span className="font-mono font-semibold text-foreground">.{domain}</span> domain.
                        </p>
                    </div>

                    {/* M3 Segmented Protocol Selector */}
                    <div className="inline-flex items-center bg-surface-container-high p-1 rounded-full shadow-xs">
                        <button
                            type="button"
                            onClick={() => setProtocol("auto")}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                protocol === "auto"
                                    ? "bg-secondary text-secondary-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            Auto
                        </button>
                        <button
                            type="button"
                            onClick={() => setProtocol("rdap")}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                protocol === "rdap"
                                    ? "bg-secondary text-secondary-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            ⚡ RDAP
                        </button>
                        <button
                            type="button"
                            onClick={() => setProtocol("whois")}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-200 ease-m3-standard active:scale-95 cursor-pointer ${
                                protocol === "whois"
                                    ? "bg-secondary text-secondary-foreground shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            📜 WHOIS
                        </button>
                    </div>
                </div>

                {/* M3 Search Input Form */}
                <form
                    onSubmit={handleLookup}
                    {...({
                        toolname: "lookup_domain_whois_rdap",
                        tooldescription: `Lookup live WHOIS and RDAP registration status and expiration date for any domain under .${domain}`
                    } as any)}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200 ease-m3-standard pointer-events-none flex items-center justify-center">
                            <MaterialIcon name="search" className="text-[20px]" />
                        </div>
                        <input
                            name="domain"
                            type="text"
                            {...({
                                toolparamdescription: `Subdomain or full domain name to check under .${domain} (e.g. brand)`
                            } as any)}
                            placeholder={`e.g. brand (checks brand.${domain})`}
                            value={subdomain}
                            onChange={(e) => setSubdomain(e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            className="w-full pl-12 pr-20 h-13 rounded-full border border-outline/40 bg-surface-container-lowest dark:bg-surface-container-high text-foreground font-mono text-sm focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-m3-emphasized shadow-xs"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {subdomain && (
                                <button
                                    type="button"
                                    onClick={() => setSubdomain("")}
                                    className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all duration-150 ease-m3-standard active:scale-90 cursor-pointer"
                                    aria-label="Clear input"
                                >
                                    <MaterialIcon name="close" className="text-[16px]" />
                                </button>
                            )}
                            <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                .{domain}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-13 px-8 bg-primary text-primary-foreground font-medium rounded-full shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-0 transition-all duration-200 ease-m3-standard active:scale-95 flex-shrink-0 cursor-pointer"
                    >

                        {isLoading ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                <span>Checking...</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <MaterialIcon name="search" className="text-[18px]" />
                                <span>Check Status</span>
                            </span>
                        )}
                    </Button>
                </form>

                {/* Error Banner */}
                {error && (
                    <div className="p-5 bg-m3-error-container/30 border border-m3-error/30 rounded-3xl text-foreground text-sm flex items-start gap-3.5 shadow-xs animate-fade-in">
                        <div className="h-10 w-10 rounded-full bg-m3-error-container text-m3-on-error-container flex items-center justify-center flex-shrink-0">
                            <MaterialIcon name="error" className="text-[22px] text-destructive" />
                        </div>
                        <div className="space-y-0.5">
                            <span className="font-bold block text-foreground">Lookup Failed</span>
                            <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="pt-4 border-t border-outline-variant/40">
                        <WhoisSkeleton />
                    </div>
                )}

                {/* Results Display */}
                {!isLoading && whoisResult && (
                    <div className="space-y-6 pt-4 border-t border-outline-variant/40 animate-fade-in">
                        {!whoisResult.isRegistered ? (
                            /* Available Domain Hero Card */
                            <div className="bg-m3-success-container/20 border border-m3-success/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-elevation-1 transition-all duration-300">
                                <div className="h-14 w-14 rounded-full bg-m3-success-container text-m3-on-success-container flex items-center justify-center mx-auto border border-m3-success/30 shadow-xs">
                                    <MaterialIcon name="verified_user" className="text-[28px] text-m3-success" />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-center gap-2.5 flex-wrap">
                                        <h4 className="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight text-m3-success">
                                            {whoisResult.domain || fullDomain}
                                        </h4>
                                        <Badge variant="success" className="text-xs px-3 py-0.5 rounded-full font-mono">
                                            {whoisResult.protocol === 'rdap' ? '⚡ RDAP' : '📜 WHOIS'}
                                        </Badge>
                                    </div>
                                    <p className="text-xl font-bold text-foreground">
                                        Domain is Available!
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                                        This domain name is currently unregistered ({whoisResult.protocol === 'rdap' ? 'Verified via RESTful RDAP protocol 404' : 'Verified via WHOIS lookup'}).
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <a
                                        href={`https://www.domainesia.com/domain/?domain=${whoisResult.domain || fullDomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-8 py-3 rounded-full hover:shadow-elevation-2 active:shadow-elevation-1 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 cursor-pointer shadow-elevation-1 text-sm"
                                    >
                                        <span>Register Domain</span>
                                        <MaterialIcon name="open_in_new" className="text-[18px]" />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            /* Registered Domain Status Container */
                            <div className="space-y-5">
                                {/* Registered Domain Hero Header */}
                                <div className="bg-surface-container-high rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-elevation-1 transition-all duration-300">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h4 className="text-2xl font-mono font-bold tracking-tight text-foreground">
                                                {whoisResult.domain || fullDomain}
                                            </h4>
                                            <Badge variant="tertiary" className="rounded-full px-3 py-0.5 font-semibold text-xs border-none">
                                                Registered
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs px-3 py-0.5 font-mono rounded-full border-none">
                                                {whoisResult.protocol === 'rdap' ? '⚡ RDAP' : '📜 WHOIS (Port 43)'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                                            Managed by <strong className="font-semibold text-foreground">{whoisResult.parsed?.registrar || "Unknown Registrar"}</strong>
                                            {whoisResult.fallbackFromRdap && (
                                                <span className="text-xs font-mono bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
                                                    RDAP fallback
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {whoisResult.parsed?.expiryDate && (
                                        <div className="flex flex-col items-start md:items-end justify-center bg-surface-container-low dark:bg-surface-container p-3.5 rounded-2xl">
                                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                Expiry Date
                                            </div>

                                            <div className="flex items-center gap-2.5 mt-1">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a
                                                                href={createGoogleCalendarUrl(whoisResult.domain || fullDomain, whoisResult.parsed.expiryDate, whoisResult.parsed.registrar)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 cursor-pointer shadow-xs"
                                                                aria-label="Add expiry reminder to Google Calendar"
                                                            >
                                                                <MaterialIcon name="event" className="text-[16px]" />
                                                                <span>Remind Me</span>
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <p>Add 30-day expiry reminder to Google Calendar</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <span className="font-mono text-sm font-bold text-foreground">
                                                    {formatDate(whoisResult.parsed.expiryDate)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* M3 Navigation Tabs */}
                                <div className="flex border-b border-surface-container-highest gap-6">
                                    <button
                                        type="button"
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
                                        type="button"
                                        onClick={() => setActiveTab('raw')}
                                        className={`pb-3 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] relative cursor-pointer ${
                                            activeTab === 'raw'
                                                ? 'text-primary border-b-2 border-primary'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <MaterialIcon name="terminal" className="text-[18px]" /> {whoisResult.protocol === 'rdap' ? 'Raw RDAP JSON' : 'Raw WHOIS Record'}
                                        </span>
                                    </button>
                                </div>

                                {/* Structured Summary Tab */}
                                {activeTab === 'summary' && whoisResult.parsed && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                        {/* Dates Card */}
                                        <div className="bg-surface-container-low rounded-2xl p-5 space-y-3.5 shadow-xs">
                                            <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <MaterialIcon name="event" className="text-[18px] text-primary" /> Important Dates
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-muted-foreground font-medium">Registered:</div>
                                                <div className="font-semibold text-foreground">{formatDate(whoisResult.parsed.createdDate)}</div>

                                                <div className="text-muted-foreground font-medium">Expires:</div>
                                                <div className="font-semibold text-foreground">{formatDate(whoisResult.parsed.expiryDate)}</div>

                                                <div className="text-muted-foreground font-medium">Last Updated:</div>
                                                <div className="font-semibold text-foreground">{formatDate(whoisResult.parsed.updatedDate)}</div>
                                            </div>
                                        </div>

                                        {/* Registrar & Status Card */}
                                        <div className="bg-surface-container-low rounded-2xl p-5 space-y-3.5 shadow-xs">
                                            <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                <MaterialIcon name="language" className="text-[18px] text-primary" /> Registrar &amp; Status
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-muted-foreground font-medium">Registrar:</div>
                                                <div className="font-semibold text-foreground truncate" title={whoisResult.parsed.registrar || "N/A"}>
                                                    {whoisResult.parsed.registrar || "N/A"}
                                                </div>

                                                <div className="text-muted-foreground font-medium">Domain Status:</div>
                                                <div className="font-medium text-foreground space-y-1">
                                                    {whoisResult.parsed.status && whoisResult.parsed.status.length > 0 ? (
                                                        whoisResult.parsed.status.slice(0, 3).map((st: string, idx: number) => {
                                                            const cleanSt = st.split(' ')[0] || st;
                                                            return (
                                                                <Badge key={idx} variant="outline" className="text-[10px] py-0.5 px-2 rounded-md capitalize block w-fit truncate border-none bg-surface-container-high" title={st}>
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

                                        {/* Nameservers Card */}
                                        {whoisResult.parsed.nameServers && whoisResult.parsed.nameServers.length > 0 && (
                                            <div className="bg-surface-container-low rounded-2xl p-5 space-y-3.5 md:col-span-2 shadow-xs">
                                                <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <MaterialIcon name="language" className="text-[18px] text-primary" /> DNS Nameservers
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {whoisResult.parsed.nameServers.map((ns: string, idx: number) => (
                                                        <Badge key={idx} variant="secondary" className="font-mono text-xs px-3 py-1 rounded-lg bg-surface-container-high text-foreground border-none">
                                                            {ns.toLowerCase()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Raw Payload Tab */}
                                {activeTab === 'raw' && whoisResult.raw && (
                                    <div className="space-y-3 animate-fade-in">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {whoisResult.protocol === 'rdap' ? 'RESTful RDAP JSON payload' : 'whois query output'}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyRaw}
                                                className="rounded-full text-xs h-8 gap-1.5 border-none bg-surface-container-low cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 shadow-xs"
                                            >
                                                {copiedRaw ? (
                                                    <>
                                                        <MaterialIcon name="check" className="text-[16px] text-primary" />
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
                                        <pre className="bg-surface-container-lowest dark:bg-black/60 text-foreground rounded-2xl p-5 font-mono text-xs leading-relaxed overflow-x-auto overflow-y-auto max-h-[450px] shadow-elevation-1 custom-scrollbar">
                                            {whoisResult.raw}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


