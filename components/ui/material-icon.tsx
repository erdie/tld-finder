import React from "react";
import { cn } from "@/lib/utils";

export interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
    name: string;
    filled?: boolean;
    weight?: number;
    size?: number | string;
    className?: string;
}

/**
 * MaterialIcon component using Google Material Symbols / Material Icons (https://fonts.google.com/icons)
 * Default weight: 300 (Light stroke for clean, modern M3 aesthetics)
 */
export function MaterialIcon({
    name,
    filled = false,
    weight = 300,
    size,
    className,
    style,
    ...props
}: MaterialIconProps) {
    const fillValue = filled ? 1 : 0;
    return (
        <span
            className={cn(
                "material-symbols-rounded notranslate select-none inline-flex items-center justify-center align-middle shrink-0 leading-none",
                filled && "filled",
                className
            )}
            style={{
                fontSize: typeof size === "number" ? `${size}px` : size,
                fontVariationSettings: `'FILL' ${fillValue}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
                ...style,
            }}
            aria-hidden="true"
            translate="no"
            {...props}
        >
            {name}
        </span>
    );
}
