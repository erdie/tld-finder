"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface PopoverContextType {
    open: boolean
    setOpen: (open: boolean) => void
    triggerRef: React.RefObject<HTMLElement | null>
    contentRef: React.RefObject<HTMLDivElement | null>
}

const PopoverContext = React.createContext<PopoverContextType | null>(null)

interface PopoverProps {
    children: React.ReactNode
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

function Popover({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: PopoverProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const triggerRef = React.useRef<HTMLElement | null>(null)
    const contentRef = React.useRef<HTMLDivElement | null>(null)

    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen

    const handleOpenChange = React.useCallback(
        (next: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(next)
            }
            onOpenChange?.(next)
        },
        [isControlled, onOpenChange]
    )

    // Outside click & Escape listener
    React.useEffect(() => {
        if (!isOpen) return

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node
            if (
                triggerRef.current?.contains(target) ||
                contentRef.current?.contains(target)
            ) {
                return
            }
            handleOpenChange(false)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleOpenChange(false)
            }
        }

        document.addEventListener("mousedown", handlePointerDown, true)
        document.addEventListener("touchstart", handlePointerDown, true)
        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("mousedown", handlePointerDown, true)
            document.removeEventListener("touchstart", handlePointerDown, true)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen, handleOpenChange])

    return (
        <PopoverContext.Provider
            value={{
                open: isOpen,
                setOpen: handleOpenChange,
                triggerRef,
                contentRef,
            }}
        >
            {children}
        </PopoverContext.Provider>
    )
}

interface PopoverTriggerProps extends React.HTMLAttributes<HTMLElement> {
    asChild?: boolean
    children: React.ReactNode
}

const PopoverTrigger = React.forwardRef<HTMLElement, PopoverTriggerProps>(
    ({ asChild, children, className, ...props }, ref) => {
        const context = React.useContext(PopoverContext)

        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            context?.setOpen(!context.open)
        }

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<any>, {
                ref: (node: any) => {
                    if (context?.triggerRef) (context.triggerRef as any).current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) (ref as any).current = node
                },
                onClick: (e: React.MouseEvent) => {
                    (children.props as any)?.onClick?.(e)
                    handleClick(e)
                },
                className: cn((children.props as any)?.className, className),
                ...props,
            })
        }

        return (
            <button
                type="button"
                ref={(node) => {
                    if (context?.triggerRef) (context.triggerRef as any).current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) (ref as any).current = node
                }}
                onClick={handleClick}
                className={cn("inline-flex items-center justify-center", className)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverAnchor = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />
)
PopoverAnchor.displayName = "PopoverAnchor"

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: "start" | "center" | "end"
    side?: "top" | "bottom" | "left" | "right"
    sideOffset?: number
    collisionPadding?: number
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
    (
        {
            className,
            align = "center",
            side = "top",
            sideOffset = 8,
            collisionPadding = 16,
            children,
            style,
            ...props
        },
        ref
    ) => {
        const context = React.useContext(PopoverContext)
        const [mounted, setMounted] = React.useState(false)
        const [position, setPosition] = React.useState<{
            top: number
            left: number
            transform: string
            placedSide: "top" | "bottom"
        } | null>(null)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        const updatePosition = React.useCallback(() => {
            if (!context?.triggerRef.current) return

            const triggerRect = context.triggerRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            // Estimated height for collision checks
            const estimatedHeight = 320
            const fitsAbove = triggerRect.top - estimatedHeight - sideOffset >= collisionPadding
            const fitsBelow = triggerRect.bottom + estimatedHeight + sideOffset <= viewportHeight - collisionPadding

            let placedSide: "top" | "bottom" = side === "top" ? (fitsAbove || !fitsBelow ? "top" : "bottom") : (fitsBelow || !fitsAbove ? "bottom" : "top")

            let top = 0
            if (placedSide === "top") {
                top = triggerRect.top - sideOffset
            } else {
                top = triggerRect.bottom + sideOffset
            }

            // Horizontal position: anchor at trigger center
            let targetLeft = triggerRect.left + triggerRect.width / 2

            // Target popover max width on mobile vs desktop
            const popoverWidth = Math.min(viewportWidth - collisionPadding * 2, 420)
            const halfWidth = popoverWidth / 2

            // Clamp so popover center never pushes edges off screen
            let clampedLeft = Math.max(
                collisionPadding + halfWidth,
                Math.min(targetLeft, viewportWidth - collisionPadding - halfWidth)
            )

            const transform = placedSide === "top"
                ? "translate(-50%, -100%)"
                : "translate(-50%, 0)"

            setPosition({
                top,
                left: clampedLeft,
                transform,
                placedSide,
            })
        }, [context, side, sideOffset, collisionPadding])

        React.useLayoutEffect(() => {
            if (!context?.open) return
            updatePosition()

            window.addEventListener("resize", updatePosition)
            window.addEventListener("scroll", updatePosition, true)

            return () => {
                window.removeEventListener("resize", updatePosition)
                window.removeEventListener("scroll", updatePosition, true)
            }
        }, [context?.open, updatePosition])

        if (!mounted || !context?.open || !position) return null

        return createPortal(
            <>
                {/* Backdrop Layer */}
                <div
                    className="fixed inset-0 z-[9990] bg-black/10 dark:bg-black/25 backdrop-blur-[1px] animate-fade-in transition-opacity duration-200"
                    onClick={() => context.setOpen(false)}
                />

                {/* Popover Content Card */}
                <div
                    ref={(node) => {
                        if (context.contentRef) (context.contentRef as any).current = node
                        if (typeof ref === "function") ref(node)
                        else if (ref) (ref as any).current = node
                    }}
                    role="dialog"
                    aria-modal="true"
                    style={{
                        position: "fixed",
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        transform: position.transform,
                        zIndex: 9999,
                        ...style,
                    }}
                    className={cn(
                        "rounded-3xl border border-outline-variant/60 bg-surface-container-high dark:bg-surface-container-highest text-foreground shadow-elevation-3 outline-none backdrop-blur-xl animate-scale-in ease-m3-emphasized",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </>,
            document.body
        )
    }
)
PopoverContent.displayName = "PopoverContent"

const PopoverClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, onClick, ...props }, ref) => {
        const context = React.useContext(PopoverContext)
        return (
            <button
                type="button"
                ref={ref}
                onClick={(e) => {
                    onClick?.(e)
                    context?.setOpen(false)
                }}
                className={cn("cursor-pointer", className)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
PopoverClose.displayName = "PopoverClose"

const PopoverArrow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => null
)
PopoverArrow.displayName = "PopoverArrow"

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose, PopoverArrow }
