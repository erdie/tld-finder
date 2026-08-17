"use client";

import React from "react";

/**
 * App Router Template for Material Design 3 Page Transitions.
 * Unlike layout.tsx which persists across navigations, template.tsx remounts on every route change,
 * applying the M3 Emphasized Decelerate motion curve to smoothly enter new pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className="m3-page-transition flex flex-col flex-1 min-h-screen">
            {children}
        </div>
    );
}
