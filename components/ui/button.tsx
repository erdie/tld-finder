"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Lightweight Slot for asChild pattern without Radix UI
function Slot({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
    if (React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ...props,
            ...(children.props || {}),
            className: cn(className, (children.props as any)?.className),
        })
    }
    return null
}

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-m3-standard focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-98 cursor-pointer select-none",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-0 rounded-full",
                filled:
                    "bg-primary text-primary-foreground shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-0 rounded-full",
                tonal:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-elevation-1 hover:shadow-elevation-2 rounded-full",
                outline:
                    "border border-outline/50 bg-transparent hover:bg-foreground/5 text-foreground rounded-full",
                outlined:
                    "border border-outline/50 bg-transparent hover:bg-foreground/5 text-foreground rounded-full",
                ghost:
                    "hover:bg-foreground/8 text-foreground rounded-full",
                text:
                    "hover:bg-foreground/8 text-foreground rounded-full",
                link:
                    "text-primary underline-offset-4 hover:underline p-0 h-auto",
                elevated:
                    "bg-surface-container-high text-primary shadow-elevation-1 hover:shadow-elevation-2 rounded-full",
            },
            size: {
                default: "h-11 px-6 py-2.5 rounded-full text-sm",
                sm: "h-9 px-4 rounded-full text-xs font-medium",
                lg: "h-13 px-8 rounded-full text-base",
                icon: "h-10 w-10 p-0 rounded-full",
                "icon-sm": "h-8 w-8 p-0 rounded-full",
                "icon-xs": "h-7 w-7 p-0 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        if (asChild) {
            return (
                <Slot
                    className={cn(buttonVariants({ variant, size, className }))}
                    {...props}
                />
            )
        }
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
