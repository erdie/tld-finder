import { NextResponse } from "next/server"
import { tlds } from "@/data/tlds"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || ""
    const assignment = searchParams.get("assignment") || (searchParams.get("hideUnassigned") === "true" ? "assigned" : "all")
    const byExtensions = searchParams.get("byExtensions") === "true"
    const byManagers = searchParams.get("byManagers") === "true"

    const trimmedQuery = query.trim().toLowerCase()
    // If query starts with a dot '.', force extension-only search
    const isExtensionOnly = trimmedQuery.startsWith(".") || (byExtensions && !byManagers)

    const results = tlds.filter((tld) => {
        const matchesType = type ? tld.type.toLowerCase() === type.toLowerCase() : true
        
        let matchesAssignment = true
        const isNotAssigned = tld.tldManager.toLowerCase() === "not assigned"
        if (assignment === "assigned") {
            matchesAssignment = !isNotAssigned
        } else if (assignment === "unassigned") {
            matchesAssignment = isNotAssigned
        }

        let matchesQuery = true
        if (trimmedQuery) {
            if (isExtensionOnly) {
                matchesQuery = tld.domain.toLowerCase().includes(trimmedQuery)
            } else if (byManagers) {
                matchesQuery = tld.tldManager.toLowerCase().includes(trimmedQuery)
            } else {
                matchesQuery = tld.domain.toLowerCase().includes(trimmedQuery) ||
                               tld.tldManager.toLowerCase().includes(trimmedQuery)
            }
        }

        return matchesType && matchesAssignment && matchesQuery
    })

    // Sort results if there is a search query
    if (trimmedQuery) {
        results.sort((a, b) => {
            const aDom = a.domain.toLowerCase()
            const bDom = b.domain.toLowerCase()

            // 1. Exact domain match first (e.g. ".com" or ".id")
            if (aDom === trimmedQuery && bDom !== trimmedQuery) return -1
            if (bDom === trimmedQuery && aDom !== trimmedQuery) return 1

            // 2. Domain starting with query next (e.g. ".comcast" when query is ".com")
            const aStarts = aDom.startsWith(trimmedQuery)
            const bStarts = bDom.startsWith(trimmedQuery)
            if (aStarts && !bStarts) return -1
            if (!aStarts && bStarts) return 1

            // 3. Shorter domain length first
            return aDom.length - bDom.length
        })
    }

    return NextResponse.json(results)
}

