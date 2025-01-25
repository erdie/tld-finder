"use client"

import * as React from "react"
import { Github } from 'lucide-react'

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
                className="flex items-center space-x-1 gap-0.5 cursor-pointer"
            >
                <Github className="h-[1.2rem] w-[1.2rem]" />
                <span className="text-sm">Star on Github</span>
            </Button>
        </a>
    )
}
