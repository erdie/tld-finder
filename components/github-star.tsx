"use client"

import * as React from "react"
import { Star } from 'lucide-react'

import { Button } from "@/components/ui/button"

export function GithubStarButton() {
    
    return (
        <a
            href="https://github.com/erdie/tld-finder/"
            target="_blank"
            rel="noopener noreferrer"
        >
            <Button
                variant="ghost"
                size="default"
                className="flex items-center space-x-1 gap-0.5"
            >
                <Star className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="text-sm">Star on Github</span>
            </Button>
        </a>
    )
}
