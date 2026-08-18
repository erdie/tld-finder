import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow-xs",
                secondary:
                    "border-transparent bg-secondary-container text-on-secondary-container",
                tonal:
                    "border-transparent bg-secondary-container text-on-secondary-container",
                outline:
                    "border-outline-variant/60 bg-surface-container-low text-foreground",
                surface:
                    "border-transparent bg-surface-container-high text-foreground",
                success:
                    "border-m3-success/20 bg-m3-success-container text-m3-on-success-container font-semibold",
                error:
                    "border-m3-error/20 bg-m3-error-container text-m3-on-error-container font-semibold",
                destructive:
                    "border-m3-error/20 bg-m3-error-container text-m3-on-error-container font-semibold",
                tertiary:
                    "border-m3-tertiary/20 bg-m3-tertiary-container text-m3-on-tertiary-container",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }


