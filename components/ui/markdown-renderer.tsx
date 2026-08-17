"use client"

import React, { ReactNode } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    if (!content) return null;

    // Helper to render inline markdown styles: bold, italic, code, links
    const renderInline = (text: string): ReactNode => {
        // Pattern to capture markdown links, bold, italic, and inline code
        const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
        const parts = text.split(regex);

        return parts.map((part, idx) => {
            if (!part) return null;

            // Bold: **text**
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                return (
                    <strong key={idx} className="font-bold text-foreground">
                        {part.slice(2, -2)}
                    </strong>
                );
            }

            // Italic: *text*
            if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
                return (
                    <em key={idx} className="italic text-foreground/80">
                        {part.slice(1, -1)}
                    </em>
                );
            }

            // Inline Code: `code`
            if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
                return (
                    <code
                        key={idx}
                        className="font-mono text-[11px] bg-surface-container-highest/80 text-primary px-1.5 py-0.5 rounded-md border border-outline-variant/40"
                    >
                        {part.slice(1, -1)}
                    </code>
                );
            }

            // Markdown Link [text](url)
            if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    const [, linkText, url] = match;
                    let safeUrl = url.trim();
                    if (!/^https?:\/\//i.test(safeUrl)) {
                        safeUrl = `https://${safeUrl}`;
                    }
                    return (
                        <a
                            key={idx}
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5 break-all transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span>{linkText}</span>
                            <MaterialIcon name="open_in_new" className="text-[12px] opacity-75 inline" />
                        </a>
                    );
                }
            }

            return part;
        });
    };

    // Split text into distinct blocks by double newlines or multiple newlines
    const blocks = content.trim().split(/\n\s*\n+/);

    return (
        <div className={`space-y-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed break-words [overflow-wrap:anywhere] ${className}`}>
            {blocks.map((block, bIdx) => {
                const lines = block.split(/\n/);
                const isList = lines.length > 0 && lines.every(l => /^\s*([*\-•]|\d+\.)\s+/.test(l));

                if (isList) {
                    return (
                        <ul key={bIdx} className="space-y-1.5 my-1.5 pl-1">
                            {lines.map((line, lIdx) => {
                                const cleanLine = line.replace(/^\s*([*\-•]|\d+\.)\s+/, '');
                                return (
                                    <li key={lIdx} className="flex items-start gap-2 text-foreground/90 leading-relaxed">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                        <span className="flex-1 break-words">{renderInline(cleanLine)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    );
                }

                return (
                    <p key={bIdx} className="break-words leading-relaxed m-0">
                        {lines.map((line, lIdx) => (
                            <React.Fragment key={lIdx}>
                                {renderInline(line)}
                                {lIdx < lines.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}
