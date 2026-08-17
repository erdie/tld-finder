import type { Config } from "tailwindcss";

export default {
    content: [
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },

                // Explicit Material Design 3 semantic color tokens
                "m3-primary": "hsl(var(--md-sys-color-primary))",
                "m3-on-primary": "hsl(var(--md-sys-color-on-primary))",
                "m3-primary-container": "hsl(var(--md-sys-color-primary-container))",
                "m3-on-primary-container": "hsl(var(--md-sys-color-on-primary-container))",
                "m3-secondary": "hsl(var(--md-sys-color-secondary))",
                "m3-on-secondary": "hsl(var(--md-sys-color-on-secondary))",
                "m3-secondary-container": "hsl(var(--md-sys-color-secondary-container))",
                "m3-on-secondary-container": "hsl(var(--md-sys-color-on-secondary-container))",
                "m3-tertiary": "hsl(var(--md-sys-color-tertiary))",
                "m3-on-tertiary": "hsl(var(--md-sys-color-on-tertiary))",
                "m3-tertiary-container": "hsl(var(--md-sys-color-tertiary-container))",
                "m3-on-tertiary-container": "hsl(var(--md-sys-color-on-tertiary-container))",
                "m3-error": "hsl(var(--md-sys-color-error))",
                "m3-on-error": "hsl(var(--md-sys-color-on-error))",
                "m3-error-container": "hsl(var(--md-sys-color-error-container))",
                "m3-on-error-container": "hsl(var(--md-sys-color-on-error-container))",
                "m3-success": "hsl(var(--md-sys-color-success))",
                "m3-on-success": "hsl(var(--md-sys-color-on-success))",
                "m3-success-container": "hsl(var(--md-sys-color-success-container))",
                "m3-on-success-container": "hsl(var(--md-sys-color-on-success-container))",
                "m3-surface": "hsl(var(--md-sys-color-surface))",
                "m3-on-surface": "hsl(var(--md-sys-color-on-surface))",
                "m3-on-surface-variant": "hsl(var(--md-sys-color-on-surface-variant))",
                "m3-outline": "hsl(var(--md-sys-color-outline))",
                "m3-outline-variant": "hsl(var(--md-sys-color-outline-variant))",
                "m3-surface-container-lowest": "hsl(var(--md-sys-color-surface-container-lowest))",
                "m3-surface-container-low": "hsl(var(--md-sys-color-surface-container-low))",
                "m3-surface-container": "hsl(var(--md-sys-color-surface-container))",
                "m3-surface-container-high": "hsl(var(--md-sys-color-surface-container-high))",
                "m3-surface-container-highest": "hsl(var(--md-sys-color-surface-container-highest))",
                "m3-inverse-surface": "hsl(var(--md-sys-color-inverse-surface))",
                "m3-inverse-on-surface": "hsl(var(--md-sys-color-inverse-on-surface))",
                "m3-inverse-primary": "hsl(var(--md-sys-color-inverse-primary))",
            },
            transitionTimingFunction: {
                'm3-emphasized': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
                'm3-emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
                'm3-emphasized-accelerate': 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
                'm3-standard': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
                'm3-standard-decelerate': 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
                'm3-standard-accelerate': 'cubic-bezier(0.3, 0.0, 1.0, 1.0)',
            },
            transitionDuration: {
                'm3-short1': '50ms',
                'm3-short2': '100ms',
                'm3-short3': '150ms',
                'm3-short4': '200ms',
                'm3-medium1': '250ms',
                'm3-medium2': '300ms',
                'm3-medium3': '350ms',
                'm3-medium4': '400ms',
                'm3-long1': '450ms',
                'm3-long2': '500ms',
            },
            fontFamily: {
                sans: ["var(--font-google-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            borderRadius: {
                "m3-xs": "4px",
                "m3-sm": "8px",
                "m3-md": "12px",
                "m3-lg": "16px",
                "m3-xl": "28px",
                "m3-full": "9999px",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 4px)",
                sm: "calc(var(--radius) - 8px)",
            },

            boxShadow: {
                "elevation-0": "none",
                "elevation-1": "0px 1px 3px 1px rgba(0, 0, 0, 0.06), 0px 1px 2px 0px rgba(0, 0, 0, 0.10)",
                "elevation-2": "0px 2px 6px 2px rgba(0, 0, 0, 0.06), 0px 1px 2px 0px rgba(0, 0, 0, 0.10)",
                "elevation-3": "0px 4px 12px 3px rgba(0, 0, 0, 0.07), 0px 1px 3px 0px rgba(0, 0, 0, 0.10)",
                "elevation-4": "0px 6px 16px 4px rgba(0, 0, 0, 0.08), 0px 2px 4px 0px rgba(0, 0, 0, 0.12)",
                "elevation-5": "0px 8px 24px 6px rgba(0, 0, 0, 0.08), 0px 4px 6px 0px rgba(0, 0, 0, 0.12)",
            },
            animation: {
                'fade-in': 'm3FadeIn 0.35s cubic-bezier(0.05, 0.7, 0.1, 1.0) forwards',
                'scale-in': 'm3ScaleIn 0.3s cubic-bezier(0.05, 0.7, 0.1, 1.0) forwards',
                'shared-axis-y': 'm3SharedAxisY 0.4s cubic-bezier(0.05, 0.7, 0.1, 1.0) forwards',
                'shared-axis-x': 'm3SharedAxisX 0.35s cubic-bezier(0.05, 0.7, 0.1, 1.0) forwards',
                'expand-container': 'm3ExpandContainer 0.45s cubic-bezier(0.2, 0, 0, 1) forwards',
                'page-enter': 'm3PageEnter 0.35s cubic-bezier(0.05, 0.7, 0.1, 1.0) forwards',
            },
            keyframes: {
                m3PageEnter: {
                    '0%': { opacity: '0', transform: 'translateY(10px) scale(0.992)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                m3FadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                m3ScaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.94)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                m3SharedAxisY: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                m3SharedAxisX: {
                    '0%': { opacity: '0', transform: 'translateX(12px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                m3ExpandContainer: {
                    '0%': { opacity: '0', transform: 'scaleY(0.95)', transformOrigin: 'top' },
                    '100%': { opacity: '1', transform: 'scaleY(1)', transformOrigin: 'top' },
                },
            },

        },
    },
    plugins: [],
} satisfies Config;