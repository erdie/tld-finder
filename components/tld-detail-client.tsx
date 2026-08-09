"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
    Search01Icon, 
    Globe02Icon, 
    Copy01Icon, 
    Tick01Icon, 
    ComputerTerminal01Icon, 
    Shield01Icon, 
    AlertCircleIcon, 
    Calendar01Icon 
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function createGoogleCalendarUrl(domainName: string, expiryDateStr: string | null, registrar?: string): string {
    let datesParam = '';

    if (expiryDateStr) {
        const d = new Date(expiryDateStr);
        if (!isNaN(d.getTime())) {
            const reminderDate = new Date(d.getTime() - 30 * 24 * 60 * 60 * 1000);
            const startISO = reminderDate.toISOString();
            const startDateStr = startISO.replace(/[-:]/g, '').split('.')[0] + 'Z';
            const endD = new Date(reminderDate.getTime() + 60 * 60 * 1000);
            const endISO = endD.toISOString();
            const endDateStr = endISO.replace(/[-:]/g, '').split('.')[0] + 'Z';
            datesParam = `${startDateStr}/${endDateStr}`;
        }
    }

    const title = `${domainName} Expiration Reminder (30 Days Before)`;
    let details = `Reminder: Domain ${domainName} is scheduled to expire on ${expiryDateStr || 'the expiry date'} (in 30 days).`;
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
    const [isLoading, setIsLoading] = useState(false);
    const [whoisResult, setWhoisResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const fullDomain = subdomain.trim()
        ? (subdomain.includes('.') ? subdomain : `${subdomain}.${domain}`)
        : `example.${domain}`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = subdomain.trim() ? (subdomain.includes('.') ? subdomain : `${subdomain}.${domain}`) : `example.${domain}`;
        
        setIsLoading(true);
        setError(null);
        setWhoisResult(null);

        try {
            const res = await fetch(`/api/whois?domain=${encodeURIComponent(target)}&protocol=auto`);
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

    return (
        <div className="space-y-6">
            {/* Quick Copy Action Bar */}
            {(whoisServer || rdapServer) && (
                <div className="flex flex-wrap items-center gap-3 bg-card/60 backdrop-blur border border-border/60 rounded-lg p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Quick Copy:</span>
                    {whoisServer && (
                        <button
                            onClick={() => handleCopy(whoisServer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-mono transition-colors border border-border/50 text-foreground"
                            title="Copy WHOIS Server"
                        >
                            <span>WHOIS: {whoisServer}</span>
                            {copiedText === whoisServer ? <HugeiconsIcon icon={Tick01Icon} className="w-3.5 h-3.5 text-green-500" /> : <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                    )}
                    {rdapServer && (
                        <button
                            onClick={() => handleCopy(rdapServer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-mono transition-colors border border-border/50 text-foreground"
                            title="Copy RDAP Endpoint URL"
                        >
                            <span>RDAP Endpoint</span>
                            {copiedText === rdapServer ? <HugeiconsIcon icon={Tick01Icon} className="w-3.5 h-3.5 text-green-500" /> : <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>
                    )}
                </div>
            )}

            {/* Live Domain Availability & WHOIS Interactive Section */}
            <div className="bg-gradient-to-br from-card via-card/90 to-blue-950/20 border border-blue-500/20 rounded-lg p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <HugeiconsIcon icon={Globe02Icon} className="w-5 h-5 text-blue-500" />
                            Live WHOIS & Availability Checker for .{domain.toUpperCase()}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Test registration status or view full WHOIS & RDAP records for any .{domain} domain.
                        </p>
                    </div>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                        Live RDAP/WHOIS Engine
                    </Badge>
                </div>

                <form onSubmit={handleLookup} className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            placeholder={`e.g. brand (checks brand.${domain})`}
                            value={subdomain}
                            onChange={(e) => setSubdomain(e.target.value)}
                            className="pr-16 bg-background/80 border-border text-foreground font-mono text-sm h-11 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground font-semibold">
                            .{domain}
                        </span>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md transition-all"
                    >
                        {isLoading ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Checking...
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                <HugeiconsIcon icon={Search01Icon} className="w-4 h-4" />
                                Check Status
                            </span>
                        )}
                    </Button>
                </form>

                {/* Results Display */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-3">
                        <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold block">Lookup Failure</span>
                            <span className="text-xs text-red-300/80">{error}</span>
                        </div>
                    </div>
                )}

                {whoisResult && (
                    <div className="space-y-4 pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between flex-wrap gap-2 bg-muted/40 p-4 rounded-lg border border-border/40">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${whoisResult.isRegistered ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
                                <div>
                                    <h4 className="font-mono text-base font-bold text-foreground">
                                        {whoisResult.domain || fullDomain}
                                    </h4>
                                    <span className="text-xs text-muted-foreground">
                                        Protocol: <strong className="uppercase text-foreground">{whoisResult.protocol || 'RDAP'}</strong>
                                    </span>
                                </div>
                            </div>
                            <Badge className={whoisResult.isRegistered ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}>
                                {whoisResult.isRegistered ? 'Registered' : 'Available for Registration'}
                            </Badge>
                        </div>

                        {/* Details grid if registered */}
                        {whoisResult.parsed && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {whoisResult.parsed.registrar && (
                                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                                        <span className="text-muted-foreground font-semibold block">Registrar</span>
                                        <span className="font-medium text-foreground">{whoisResult.parsed.registrar}</span>
                                    </div>
                                )}
                                {whoisResult.parsed.createdDate && (
                                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                                        <span className="text-muted-foreground font-semibold block">Created Date</span>
                                        <span className="font-mono text-foreground">{whoisResult.parsed.createdDate}</span>
                                    </div>
                                )}
                                {whoisResult.parsed.expiryDate && (
                                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-between gap-2">
                                        <div>
                                            <span className="text-muted-foreground font-semibold block">Expiry Date</span>
                                            <span className="font-mono text-foreground">{whoisResult.parsed.expiryDate}</span>
                                        </div>
                                        <a
                                            href={createGoogleCalendarUrl(whoisResult.domain || fullDomain, whoisResult.parsed.expiryDate, whoisResult.parsed.registrar)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 transition-colors cursor-pointer"
                                            aria-label="Add to Google Calendar"
                                        >
                                            <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
                                            <span>Remind Me</span>
                                        </a>
                                    </div>
                                )}
                                {whoisResult.parsed.nameServers && whoisResult.parsed.nameServers.length > 0 && (
                                    <div className="p-3 bg-muted/30 rounded-lg border border-border/30 md:col-span-2">
                                        <span className="text-muted-foreground font-semibold block mb-1">Domain Name Servers</span>
                                        <div className="flex flex-wrap gap-1.5 font-mono">
                                            {whoisResult.parsed.nameServers.map((ns: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="text-[11px]">
                                                    {ns}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Raw record expandable */}
                        {whoisResult.raw && (
                            <details className="text-xs group">
                                <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 py-1">
                                    <HugeiconsIcon icon={ComputerTerminal01Icon} className="w-3.5 h-3.5" />
                                    <span>View Raw WHOIS / RDAP Payload</span>
                                </summary>
                                <pre className="mt-2 p-3 bg-black/80 rounded-lg text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 border border-emerald-900/30">
                                    {whoisResult.raw}
                                </pre>
                            </details>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
