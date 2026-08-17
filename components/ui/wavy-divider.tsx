import React from "react";

interface WavyDividerProps {
    className?: string;
    id?: string;
}

export function WavyDivider({ className = "", id = "m3-wavy-divider" }: WavyDividerProps) {
    return (
        <div
            className={`w-full overflow-hidden leading-none select-none pointer-events-none text-outline-variant dark:text-outline-variant/60 ${className}`}
            aria-hidden="true"
        >
            <svg
                className="w-full h-3.5"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                <defs>
                    <pattern
                        id={id}
                        width="32"
                        height="14"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 0 7 C 4 1.5, 12 1.5, 16 7 C 20 12.5, 28 12.5, 32 7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id})`} />
            </svg>
        </div>
    );
}
