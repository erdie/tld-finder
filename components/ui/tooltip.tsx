"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface TooltipContextType {
    open: boolean
    setOpen: (open: boolean) => void
    triggerRect: DOMRect | null
    setTriggerRect: (rect: DOMRect | null) => void
}

const TooltipContext = React.createContext<TooltipContextType | null>(null)

interface TooltipProviderProps {
    children: React.ReactNode
    delayDuration?: number
}

function TooltipProvider({ children }: TooltipProviderProps) {
    return <>{children}</>
}

interface TooltipProps {
    children: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    delayDuration?: number
}

function Tooltip({ children, open: controlledOpen, defaultOpen = false, onOpenChange, delayDuration = 200 }: TooltipProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null)
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)

    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen

    const handleOpen = (next: boolean) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        if (next) {
            timerRef.current = setTimeout(() => {
                if (!isControlled) setUncontrolledOpen(true)
                onOpenChange?.(true)
            }, delayDuration)
        } else {
            if (!isControlled) setUncontrolledOpen(false)
            onOpenChange?.(false)
        }
    }

    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    return (
        <TooltipContext.Provider
            value={{
                open: isOpen,
                setOpen: handleOpen,
                triggerRect,
                setTriggerRect,
            }}
        >
            {children}
        </TooltipContext.Provider>
    )
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
    asChild?: boolean
    children: React.ReactNode
}

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
    ({ asChild, children, className, ...props }, ref) => {
        const context = React.useContext(TooltipContext)
        const triggerRef = React.useRef<HTMLElement | null>(null)

        const updateRect = () => {
            if (triggerRef.current) {
                context?.setTriggerRect(triggerRef.current.getBoundingClientRect())
            }
        }

        const handleMouseEnter = (e: React.MouseEvent) => {
            updateRect()
            context?.setOpen(true)
        }

        const handleMouseLeave = () => {
            context?.setOpen(false)
        }

        const handleFocus = () => {
            updateRect()
            context?.setOpen(true)
        }

        const handleBlur = () => {
            context?.setOpen(false)
        }

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                ref: (node: any) => {
                    triggerRef.current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) (ref as any).current = node
                },
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                onFocus: handleFocus,
                onBlur: handleBlur,
                className: cn((children.props as any)?.className, className),
                ...props,
            })
        }

        return (
            <span
                ref={(node) => {
                    triggerRef.current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) (ref as any).current = node
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn("inline-block", className)}
                {...props}
            >
                {children}
            </span>
        )
    }
)
TooltipTrigger.displayName = "TooltipTrigger"

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: "top" | "bottom" | "left" | "right"
    sideOffset?: number
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
    ({ className, side = "top", sideOffset = 6, children, style, ...props }, ref) => {
        const context = React.useContext(TooltipContext)
        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        if (!mounted || !context?.open || !context.triggerRect) return null

        const { top, left, width, height, bottom, right } = context.triggerRect

        let posStyle: React.CSSProperties = {
            position: "fixed",
            zIndex: 9999,
        }

        if (side === "top") {
            posStyle = {
                ...posStyle,
                top: top - sideOffset,
                left: left + width / 2,
                transform: "translate(-50%, -100%)",
            }
        } else if (side === "bottom") {
            posStyle = {
                ...posStyle,
                top: bottom + sideOffset,
                left: left + width / 2,
                transform: "translate(-50%, 0)",
            }
        } else if (side === "left") {
            posStyle = {
                ...posStyle,
                top: top + height / 2,
                left: left - sideOffset,
                transform: "translate(-100%, -50%)",
            }
        } else if (side === "right") {
            posStyle = {
                ...posStyle,
                top: top + height / 2,
                left: right + sideOffset,
                transform: "translate(0, -50%)",
            }
        }

        return createPortal(
            <div
                ref={ref}
                role="tooltip"
                style={{ ...posStyle, ...style }}
                className={cn(
                    "z-50 overflow-hidden rounded-xl border border-outline-variant/40 bg-inverse-surface text-inverse-on-surface px-3.5 py-2 text-xs shadow-elevation-2 backdrop-blur-md pointer-events-none animate-scale-in ease-m3-standard leading-relaxed max-w-xs",
                    className
                )}
                {...props}
            >
                {children}
            </div>,
            document.body
        )
    }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
