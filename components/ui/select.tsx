"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { MaterialIcon } from "@/components/ui/material-icon"
import { cn } from "@/lib/utils"

interface SelectContextType {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
    labels: Map<string, React.ReactNode>
    registerLabel: (value: string, label: React.ReactNode) => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
    contentRef: React.RefObject<HTMLDivElement | null>
}

const SelectContext = React.createContext<SelectContextType | null>(null)

interface SelectProps {
    children: React.ReactNode
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

function Select({
    children,
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
}: SelectProps) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const [labels, setLabels] = React.useState<Map<string, React.ReactNode>>(() => new Map())
    const triggerRef = React.useRef<HTMLButtonElement | null>(null)
    const contentRef = React.useRef<HTMLDivElement | null>(null)

    const isValueControlled = controlledValue !== undefined
    const isVal = isValueControlled ? controlledValue : uncontrolledValue

    const isOpenControlled = controlledOpen !== undefined
    const isOpen = isOpenControlled ? controlledOpen : uncontrolledOpen

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (!isValueControlled) {
                setUncontrolledValue(newValue)
            }
            onValueChange?.(newValue)
            handleOpenChange(false)
        },
        [isValueControlled, onValueChange]
    )

    const handleOpenChange = React.useCallback(
        (next: boolean) => {
            if (!isOpenControlled) {
                setUncontrolledOpen(next)
            }
            onOpenChange?.(next)
        },
        [isOpenControlled, onOpenChange]
    )

    const registerLabel = React.useCallback((val: string, node: React.ReactNode) => {
        setLabels((prev) => {
            if (prev.get(val) === node) return prev
            const next = new Map(prev)
            next.set(val, node)
            return next
        })
    }, [])

    // Close on outside click or Escape
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

        document.addEventListener("mousedown", handlePointerDown)
        document.addEventListener("touchstart", handlePointerDown)
        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("mousedown", handlePointerDown)
            document.removeEventListener("touchstart", handlePointerDown)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen, handleOpenChange])

    return (
        <SelectContext.Provider
            value={{
                value: isVal,
                onValueChange: handleValueChange,
                open: isOpen,
                setOpen: handleOpenChange,
                labels,
                registerLabel,
                triggerRef,
                contentRef,
            }}
        >
            {children}
        </SelectContext.Provider>
    )
}

const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={className} {...props} />
)
SelectGroup.displayName = "SelectGroup"

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
    placeholder?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
    ({ className, placeholder, ...props }, ref) => {
        const context = React.useContext(SelectContext)
        const label = context?.labels.get(context.value)

        return (
            <span
                ref={ref}
                className={cn("truncate block text-left", !label && "text-muted-foreground", className)}
                {...props}
            >
                {label || placeholder || context?.value || ""}
            </span>
        )
    }
)
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)

    return (
        <button
            type="button"
            role="combobox"
            aria-expanded={context?.open}
            ref={(node) => {
                if (context?.triggerRef) (context.triggerRef as any).current = node
                if (typeof ref === "function") ref(node)
                else if (ref) (ref as any).current = node
            }}
            onClick={(e) => {
                e.stopPropagation()
                context?.setOpen(!context.open)
            }}
            className={cn(
                "flex h-11 w-full items-center justify-between rounded-2xl border border-outline-variant/60 bg-surface-container-high hover:bg-surface-container-highest px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground shadow-xs transition-all duration-200 ease-m3-standard focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none",
                className
            )}
            {...props}
        >
            <span className="truncate flex-1 text-left">{children}</span>
            <MaterialIcon
                name="arrow_drop_down"
                className={cn(
                    "text-[20px] text-muted-foreground transition-transform duration-200 ease-m3-standard shrink-0 ml-1.5",
                    context?.open && "rotate-180 text-primary"
                )}
            />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

interface Coords {
    top: number
    left: number
    width: number
    isFlipped: boolean
}

const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { position?: "popper" | "item-aligned" }
>(({ className, children, position = "popper", style, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    const [mounted, setMounted] = React.useState(false)
    const [coords, setCoords] = React.useState<Coords | null>(null)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const updatePosition = React.useCallback(() => {
        if (!context?.triggerRef.current) return
        const rect = context.triggerRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth
        const spaceBelow = viewportHeight - rect.bottom
        const dropdownHeight = 240
        const width = Math.max(rect.width, 180)

        const isFlipped = spaceBelow < dropdownHeight && rect.top > dropdownHeight
        const top = isFlipped ? Math.max(8, rect.top - 6 - dropdownHeight) : rect.bottom + 6

        // Clamp horizontally so it stays within viewport bounds
        const left = Math.max(12, Math.min(rect.left, viewportWidth - width - 12))

        setCoords({
            top,
            left,
            width,
            isFlipped,
        })
    }, [context])

    React.useLayoutEffect(() => {
        if (!context?.open) {
            setCoords(null)
            return
        }
        updatePosition()

        window.addEventListener("resize", updatePosition)
        window.addEventListener("scroll", updatePosition, true)

        return () => {
            window.removeEventListener("resize", updatePosition)
            window.removeEventListener("scroll", updatePosition, true)
        }
    }, [context?.open, updatePosition])

    if (!mounted || !context?.open || !coords) return null

    return createPortal(
        <div
            ref={(node) => {
                if (context.contentRef) (context.contentRef as any).current = node
                if (typeof ref === "function") ref(node)
                else if (ref) (ref as any).current = node
            }}
            style={{
                position: "fixed",
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                minWidth: `${coords.width}px`,
                maxWidth: "calc(100vw - 24px)",
                transformOrigin: coords.isFlipped ? "bottom left" : "top left",
                zIndex: 9999,
                ...style,
            }}
            className={cn(
                "max-h-72 overflow-y-auto rounded-2xl border border-outline-variant/60 bg-surface-container-high dark:bg-surface-container-highest p-1.5 text-foreground shadow-elevation-2 backdrop-blur-md animate-scale-in ease-m3-standard custom-scrollbar",
                className
            )}
            {...props}
        >
            <div className="space-y-0.5">{children}</div>
        </div>,
        document.body
    )
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider", className)}
        {...props}
    />
))
SelectLabel.displayName = "SelectLabel"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
    disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, children, value, disabled, ...props }, ref) => {
        const context = React.useContext(SelectContext)
        const isSelected = context?.value === value

        React.useEffect(() => {
            context?.registerLabel(value, children)
        }, [value, children, context])

        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            if (disabled) return
            context?.onValueChange(value)
        }

        return (
            <div
                ref={ref}
                role="option"
                aria-selected={isSelected}
                aria-disabled={disabled}
                onClick={handleClick}
                className={cn(
                    "relative flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150 ease-m3-standard select-none cursor-pointer outline-none active:scale-[0.98]",
                    isSelected
                        ? "bg-secondary text-secondary-foreground font-semibold shadow-xs"
                        : "hover:bg-foreground/8 text-foreground",
                    disabled && "pointer-events-none opacity-50",
                    className
                )}
                {...props}
            >
                <span className="truncate flex-1">{children}</span>
                {isSelected && (
                    <MaterialIcon name="check" className="text-[16px] text-primary shrink-0 ml-2 font-bold" />
                )}
            </div>
        )
    }
)
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-outline-variant/40", className)}
        {...props}
    />
))
SelectSeparator.displayName = "SelectSeparator"

const SelectScrollUpButton = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => null)
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => null)
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
}
