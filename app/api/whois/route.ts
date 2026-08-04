import { whoisDomain, firstResult } from "whoiser";
import { NextResponse } from "next/server";
import { queryRdap } from "@/lib/rdap";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawDomain = searchParams.get("domain") || "";
        const protocol = (searchParams.get("protocol") || "auto").toLowerCase();
        
        // Clean domain name
        const domain = rawDomain.trim().replace(/^\.+/, "").toLowerCase();
        
        if (!domain) {
            return NextResponse.json(
                { error: "Domain parameter is required" },
                { status: 400 }
            );
        }
        
        // Simple domain format validation (must contain at least one dot and have parts)
        const parts = domain.split('.').filter(Boolean);
        if (parts.length < 2) {
            return NextResponse.json(
                { error: "Invalid domain name format" },
                { status: 400 }
            );
        }
        
        // Try RDAP first if protocol is 'auto' or 'rdap'
        if (protocol === "auto" || protocol === "rdap") {
            try {
                console.log(`[RDAP] Querying RDAP for domain: ${domain}`);
                const rdapResult = await queryRdap(domain);
                return NextResponse.json(rdapResult);
            } catch (rdapErr: any) {
                console.warn(`[RDAP] Failed or unavailable for ${domain}: ${rdapErr.message}`);
                if (protocol === "rdap") {
                    return NextResponse.json(
                        {
                            error: `RDAP lookup failed for ${domain}`,
                            details: rdapErr.message || String(rdapErr)
                        },
                        { status: 502 }
                    );
                }
                // If protocol was 'auto', gracefully fall through to WHOIS
                console.log(`[RDAP -> WHOIS Fallback] Falling back to traditional WHOIS for: ${domain}`);
            }
        }

        // Traditional WHOIS lookup
        console.log(`[WHOIS] Querying WHOIS for domain: ${domain}`);
        const result = await whoisDomain(domain);
        const parsed = firstResult(result) || {};
        
        // Extract raw text
        let rawText = "";
        if (parsed.text && Array.isArray(parsed.text)) {
            rawText = parsed.text.join("\n");
        } else if (typeof parsed.text === "string") {
            rawText = parsed.text;
        } else {
            // fallback: aggregate from all keys
            rawText = Object.values(result)
                .map((srv: any) => (Array.isArray(srv?.text) ? srv.text.join("\n") : srv?.text || ""))
                .join("\n");
        }
        
        // Determine if domain is registered
        const hasCreatedDate = !!(parsed["Created Date"] || parsed["Creation Date"] || parsed["Registration Date"]);
        const hasRegistrar = !!parsed["Registrar"];
        const hasDomainName = !!parsed["Domain Name"];
        
        // Check for common availability indicators in the raw text
        const lowerText = rawText.toLowerCase();
        const availabilityKeywords = [
            "no match for",
            "not found",
            "no data found",
            "no entries found",
            "no object found",
            "domain not found",
            "is free",
            "available",
            "does not exist",
            "nothing found",
            "available for purchase"
        ];
        
        const matchesAvailabilityKeyword = availabilityKeywords.some(keyword => lowerText.includes(keyword));
        
        // A domain is registered if it doesn't match availability keywords AND has some identifier fields, OR if it has dates/registrar
        let isRegistered = true;
        if (matchesAvailabilityKeyword) {
            isRegistered = false;
        } else if (!hasCreatedDate && !hasRegistrar && !hasDomainName) {
            isRegistered = false;
        }
        
        // Clean and format structured fields
        const getSingleOrArray = (val: any) => {
            if (!val) return null;
            if (Array.isArray(val)) {
                return val.map(v => String(v).trim());
            }
            return [String(val).trim()];
        };

        // Expose structured JSON response
        return NextResponse.json({
            domain,
            protocol: "whois",
            fallbackFromRdap: protocol === "auto",
            isRegistered,
            parsed: {
                domainName: parsed["Domain Name"] || domain,
                registrar: parsed["Registrar"] || null,
                createdDate: parsed["Created Date"] || parsed["Creation Date"] || parsed["Registration Date"] || null,
                expiryDate: parsed["Expiry Date"] || parsed["Registry Expiry Date"] || parsed["Expiration Date"] || null,
                updatedDate: parsed["Updated Date"] || parsed["Last Updated"] || null,
                nameServers: getSingleOrArray(parsed["Name Server"] || parsed["Name Servers"]),
                status: getSingleOrArray(parsed["Domain Status"] || parsed["Status"]),
            },
            raw: rawText
        });
    } catch (error: any) {
        console.error("[WHOIS/RDAP API Error]:", error);
        return NextResponse.json(
            {
                error: "Failed to perform domain lookup",
                details: error.message || String(error)
            },
            { status: 500 }
        );
    }
}
