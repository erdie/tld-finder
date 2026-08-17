"use client"

import { Button } from "@/components/ui/button"
import { MaterialIcon } from "@/components/ui/material-icon"

export function GithubStarButton() {
    return (
        <a
            href="https://github.com/erdie/tld-finder/"
            target="_blank"
            rel="noopener noreferrer"
        >
            <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-outline-variant/60 bg-surface-container-low hover:bg-surface-container-high text-foreground rounded-full px-4 h-9 cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 shadow-xs hover:shadow-elevation-1"
            >
                <MaterialIcon name="star" filled className="text-amber-500 text-[18px]" />
                <span className="text-xs font-medium tracking-wide">Star on GitHub</span>
            </Button>
        </a>
    )
}


