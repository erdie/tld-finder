import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata, Viewport } from "next"
import { getBaseUrl } from "@/lib/site-config"

const baseUrl = getBaseUrl();

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f6faf6" },
        { media: "(prefers-color-scheme: dark)", color: "#101511" },
    ],
    width: "device-width",
    initialScale: 1,
    colorScheme: "dark light",
};

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "TLD Finder - Search Top-Level Domains, Registry Managers & WHOIS",
        template: "%s | TLD Finder"
    },
    description: "Search and explore 1,500+ IANA top-level domain extensions (.com, .dev, .id), discover registry operators, generate creative domain hacks, and run live WHOIS & RDAP domain lookups.",
    keywords: [
        "TLD finder",
        "top level domain finder",
        "WHOIS lookup",
        "RDAP lookup",
        "IANA root zone",
        "domain hacks",
        "TLD manager search",
        "gTLD finder",
        "ccTLD finder",
        "domain registry search"
    ],
    authors: [{ name: "Erdiawan", url: "https://erdiawan.com" }],
    creator: "Erdiawan",
    publisher: "TLD Finder",
    alternates: {
        canonical: "/",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        title: "TLD Finder - Search Top-Level Domains, Registry Managers & WHOIS",
        description: "Explore 1,500+ IANA top-level domains, discover registry managers, generate domain hacks, and run live WHOIS/RDAP lookups.",
        siteName: "TLD Finder",
        images: [
            {
                url: `${baseUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "TLD Finder - Top-Level Domain Registry Explorer & WHOIS Lookup",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "TLD Finder - Search Top-Level Domains & WHOIS",
        description: "Discover registry operators, generate domain hacks, and run live WHOIS/RDAP lookups.",
        images: [`${baseUrl}/og-image.png`],
    },
}

const jsonLd = [
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TLD Finder",
        "url": baseUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    },
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "TLD Finder",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "description": "Interactive search engine for 1,500+ IANA top-level domains, TLD registry managers, WHOIS/RDAP records, and domain hacks."
    },
    {
        "@context": "https://schema.org",
        "@type": "DataCatalog",
        "name": "IANA Root Zone Database",
        "description": "Comprehensive delegation records, registry operators, and contact details for all active top-level domains.",
        "url": "https://www.iana.org/domains/root/db"
    }
]

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                {/* High Priority Font Preload */}
                <link
                    rel="preload"
                    href="/fonts/material-symbols-rounded.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />

                {/* Google Fonts Preconnect & DNS-Prefetch */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
                <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400..700&family=Google+Sans+Code:wght@400..700&display=swap"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="font-sans antialiased" suppressHydrationWarning>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>


        </html>
    )
}

