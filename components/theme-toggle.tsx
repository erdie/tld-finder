"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

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
            <Button variant="ghost" size="icon" className="relative">
                <div className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative"
        >
            <Sun 
                className={`h-5 w-5 transition-all ${
                    theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
                }`}
            />
            <Moon 
                className={`absolute h-5 w-5 transition-all ${
                    theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
                }`}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export default ThemeToggle;