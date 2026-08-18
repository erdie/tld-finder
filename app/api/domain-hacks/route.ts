import { NextResponse } from "next/server";
import { generateDomainHacks } from "@/lib/domain-hacks";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q") || "";

        if (!q.trim()) {
            return NextResponse.json([]);
        }

        const hacks = generateDomainHacks(q);
        return NextResponse.json(hacks, {
            headers: {
                "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
            },
        });
    } catch (error: any) {
        console.error("[Domain Hacks API Error]:", error);
        return NextResponse.json(
            { error: "Failed to generate domain hacks", details: error.message || String(error) },
            { status: 500 }
        );
    }
}
