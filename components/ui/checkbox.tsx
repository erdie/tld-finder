"use client"

import * as React from "react"
import { MaterialIcon } from "@/components/ui/material-icon"
import { cn } from "@/lib/utils"

export interface CheckboxProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked?: boolean | "indeterminate"
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ className, checked: controlledChecked, defaultChecked = false, onCheckedChange, disabled, ...props }, ref) => {
        const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked)
        const isControlled = controlledChecked !== undefined
        const isChecked = isControlled ? Boolean(controlledChecked) : uncontrolledChecked

        const toggle = () => {
            if (disabled) return
            const next = !isChecked
            if (!isControlled) {
                setUncontrolledChecked(next)
            }
            onCheckedChange?.(next)
        }

        return (
            <button
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                disabled={disabled}
                ref={ref}
                onClick={toggle}
                onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                        e.preventDefault()
                        toggle()
                    }
                }}
                className={cn(
                    "peer group relative inline-flex items-center justify-center p-1 -m-1 rounded-full cursor-pointer focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {/* M3 State layer (hover & active ripple ring) */}
                <span className="absolute inset-0 rounded-full bg-transparent group-hover:bg-primary/10 group-active:bg-primary/20 transition-colors duration-150 pointer-events-none" />

                {/* Checkbox Box */}
                <span
                    className={cn(
                        "relative h-[18px] w-[18px] rounded-[5px] border-2 transition-all duration-200 ease-m3-standard flex items-center justify-center pointer-events-none",
                        isChecked
                            ? "bg-primary border-primary text-primary-foreground shadow-xs"
                            : "border-outline bg-transparent group-hover:border-foreground/80"
                    )}
                >
                    <MaterialIcon
                        name="check"
                        className={cn(
                            "text-[14px] font-bold text-primary-foreground transition-all duration-200 ease-m3-emphasized",
                            isChecked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        )}
                    />
                </span>
            </button>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
