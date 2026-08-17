import React from "react";
import { WavyDivider } from "@/components/ui/wavy-divider";

export function SiteFooter() {
    return (
        <footer className="w-full bg-surface-container-lowest/50 dark:bg-surface-container-low/40 transition-colors duration-300">
            {/* Material Design 3 Wavy Border Divider */}
            <WavyDivider id="m3-footer-wavy-border" />

            {/* Footer Content */}
            <div className="py-7 text-sm text-muted-foreground">
                <div className="container mx-auto px-4 sm:px-6 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-center sm:text-left">
                        © {new Date().getFullYear()} <span className="font-semibold text-foreground">TLD Finder</span> — Explore IANA Root Zone Extensions &amp; Registry Managers
                    </p>
                    <div className="flex items-center gap-5 font-medium">
                        <a
                            href="https://www.iana.org/domains/root/db"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            IANA Database
                        </a>
                        <a
                            href="https://rdap.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            RDAP Protocol
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
