import "@/app/globals.css"
import { JetBrains_Mono, Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"

const mono = JetBrains_Mono({ subsets: ["latin"] })
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "TLD Finder",
    description: "Explore the world's top-level domains and uncover the organizations that manage them!",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
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

