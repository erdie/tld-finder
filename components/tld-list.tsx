import { Badge } from "@/components/ui/badge"
import type { TLD } from "@/data/tlds"

interface TldListProps {
    results: TLD[]
    query: string
    isLoading: boolean
}

export function TldList({ results, query, isLoading }: TldListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse bg-muted rounded-lg p-4 space-y-2"
                    >
                        <div className="h-5 bg-muted-foreground/20 rounded w-1/4"></div>
                        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (!query) {
        return null
    }

    if (!results.length) {
        return (
            <div className="text-center text-muted-foreground">
                No results found. Try searching for something else.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {results.map((tld) => (
                <div
                    key={tld.domain}
                    className="bg-muted/50 rounded-lg p-4 space-y-2"
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-mono">{tld.domain}</h3>
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">
                            {tld.type}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {tld.tldManager}
                    </p>
                </div>
            ))}
        </div>
    )
}

