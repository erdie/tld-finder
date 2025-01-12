import { NextResponse } from "next/server"
import { tlds } from "@/data/tlds"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || ""
    const byExtensions = searchParams.get("byExtensions") === "true"
    const byManagers = searchParams.get("byManagers") === "true"

    const results = tlds.filter((tld) => {
        const matchesType = type ? tld.type.toLowerCase() === type.toLowerCase() : true
        
        let matchesQuery = true
        if (query) {
            if (byExtensions && byManagers) {
                matchesQuery = tld.domain.toLowerCase().includes(query.toLowerCase()) ||
                               tld.tldManager.toLowerCase().includes(query.toLowerCase())
            } else if (byExtensions) {
                matchesQuery = tld.domain.toLowerCase().includes(query.toLowerCase())
            } else if (byManagers) {
                matchesQuery = tld.tldManager.toLowerCase().includes(query.toLowerCase())
            } else {
                matchesQuery = tld.domain.toLowerCase().includes(query.toLowerCase()) ||
                               tld.tldManager.toLowerCase().includes(query.toLowerCase())
            }
        }

        return matchesType && matchesQuery
    })

    return NextResponse.json(results)
}

