import { NextResponse } from "next/server"
import { tlds } from "@/data/tlds"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
        return NextResponse.json([])
    }

    const results = tlds.filter((tld) =>
        tld.domain.toLowerCase().includes(query.toLowerCase())
    )

    return NextResponse.json(results)
}

