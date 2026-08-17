"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { MaterialIcon } from "@/components/ui/material-icon"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Prevent hydration mismatch by only rendering after mount
    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Render a placeholder with the same dimensions to prevent layout shift
    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="relative rounded-full">
                <div className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative rounded-full hover:bg-foreground/8 active:bg-foreground/12 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-90 cursor-pointer overflow-hidden"
            aria-label="Toggle light/dark theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
            <MaterialIcon 
                name="light_mode"
                className={`transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] text-[22px] ${
                    theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
                }`}
            />
            <MaterialIcon 
                name="dark_mode"
                className={`absolute transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] text-[22px] ${
                    theme === 'dark' ? 'rotate-0 scale-100 opacity-100 text-primary' : '-rotate-90 scale-0 opacity-0'
                }`}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}