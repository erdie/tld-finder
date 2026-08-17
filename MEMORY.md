# MEMORY.md - Project Knowledge Base & Technical Context

## 📌 Project Overview
**TLD Finder** (`tld-finder`) is a modern, responsive Jamstack web application designed to explore top-level domains (TLDs) from the IANA Root Zone, provide SERP & SEO friendly dedicated TLD detail pages (`/tld/[domain]`), deliver AI-powered insights into TLD registry managers via Google Gemini, perform live real-time WHOIS & RDAP lookups, and schedule domain expiration reminders to Google Calendar.

- **Production Base URL**: Configured via `NEXT_PUBLIC_BASE_URL` (`https://tld-finder.erdiawan.com`)
- **Primary Repository Workspace**: `/Users/erdi/Data/Codes/tld-finder`

---

## 🛠️ Tech Stack & Architecture

### Core Framework & Runtime
- **Framework**: Next.js 16.1.6 (React 19, Next.js App Router, Turbopack enabled for dev mode)
- **Language**: TypeScript 5, Node.js (v20 runtime target)
- **Package Manager**: Yarn (`yarn.lock`)

### Frontend & Styling
- **UI Design System**: Native Material Design 3 (M3 / Material You) Components (Pure M3 Popovers, M3 Select Dropdowns, M3 Checkboxes, M3 Tooltips, M3 Buttons, M3 Badges & Chips)
- **Utility Libraries**: `class-variance-authority` (CVA), `clsx`, `tailwind-merge`
- **Theming**: `next-themes` (Dark / Light mode support)
- **Iconography**: Google Material Symbols (`material-symbols`)

### AI & Data Engine
- **Gemini AI Integration**: `@google/generative-ai` (^0.24.1) querying `gemini-3.5-flash-lite` (with fallback to `gemini-3.1-flash-lite` and `gemini-2.5-flash-lite`) for real-time, concise Markdown overviews of TLD registry managers.
- **WHOIS Engine**: `whoiser` (^2.0.0-beta.10) for serverless WHOIS queries, parsing domain registration dates, registrar metadata, name servers, status, and raw logs.
- **RDAP Engine**: RESTful RDAP client (`lib/rdap.ts`) querying bootstrap servers for structured JSON responses.
- **Web Scraper Suite**:
  - Index Scraper (`scripts/scrape.js`): Scrapes master list of TLDs (`https://www.iana.org/domains/root/db`) to `data/iana-tld.json`.
  - Stealth Detail Scraper (`scripts/scrape-details.js`): Scrapes individual delegation pages (`https://www.iana.org/domains/root/db/{domain}.html`) to `data/iana-tld-details.json` with browser header mimicry, User-Agent rotation, rate limiting jitter, IDN Punycode support (`domainToASCII`), and backoff retries.

### Hosting & Infrastructure
- **Platform**: Netlify (Serverless API Routes & Scheduled Functions)
- **Environment Configuration**: Centralized base URL handler in `lib/site-config.ts` powered by `NEXT_PUBLIC_BASE_URL`.
- **Automated Data Maintenance**: Netlify Scheduled Function (`netlify/functions/trigger-build.js`) configured with cron (`0 0 1,15 * *`) to auto-trigger a Netlify Build Hook, executing `yarn scrape:all && next build` bi-weekly.

---

## 🚀 Key Features

1. **IANA Root Database Explorer**
   - Instant search across 1,500+ top-level domains by extension (e.g. `.com`, `.ai`, `.id`) or registry operator name.
   - Filtering by TLD classification: Generic (`gTLD`), Country Code (`ccTLD`), or Sponsored (`sTLD`).

2. **SERP & SEO-Friendly TLD Detail Pages (`/tld/[domain]`)**
   - Pre-rendered static pages (SSG via `generateStaticParams`) for all 1,500+ TLDs.
   - Dynamic meta tags, canonical links, OpenGraph images, Twitter cards powered by `NEXT_PUBLIC_BASE_URL`.
   - JSON-LD structured data (Schema.org `BreadcrumbList`, `WebPage`, `Organization`).
   - Detailed Sponsoring Organisation, Administrative Contact, Technical Contact, Authoritative Name Servers, WHOIS/RDAP endpoints, and embedded live domain availability checker.
   - Related TLDs cross-linking for search engine crawl depth.

3. **Google Calendar Expiration Reminders ("Remind Me")**
   - Integrated **Remind Me** button for registered domain WHOIS/RDAP lookups.
   - Automatically calculates event date **30 days prior to domain expiration** scheduled at **09:00 AM WIB / Jakarta (GMT+7)**.
   - Responsive layout alignment (right side on mobile `< md`, left side on desktop `>= md`).

4. **URL Query String Synchronization & Deep Linking**
   - Synchronizes domain queries (`?domain=domainname.com`) and search terms (`?q=...`) dynamically into browser URL using `replaceState`.
   - Cleans protocol prefixes (`https://`, `www.`) automatically and supports browser `popstate` history navigation.

5. **Browser-Mimicking Stealth Detail Scraper**
   - Scrapes individual IANA delegation pages safely using realistic browser navigation headers (`Sec-Fetch-*`, `Sec-Ch-Ua`, `User-Agent` pool, `Referer`), jitter delays, and IDN Punycode support.

6. **Gemini AI Registry Insights (`gemini-3.5-flash-lite`)**
   - On-demand AI summary generation for any TLD registry manager.

7. **RDAP & WHOIS Domain Availability Engine**
   - Auto protocol selection (RDAP RESTful JSON preferred with WHOIS port 43 fallback).
   - Real-time status indication (Registered vs Available for registration).

8. **Domain Hack Generator (`lib/domain-hacks.ts`)**
   - Automatic split-word matching against 1,500+ active IANA TLDs (Direct, Path, Subdomain splits).

9. **Automated Bi-weekly Data Pipeline**
   - Netlify Scheduled Function triggers build hook on the 1st and 15th of every month (`0 0 1,15 * *`).

---

## 📁 Project Structure

```
tld-finder/
├── app/                        # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── ai-info/route.ts    # POST: Gemini AI TLD manager lookup
│   │   ├── domain-hacks/route.ts# GET: Split-word domain hack generator
│   │   ├── tld/route.ts        # GET: Filtered TLD list query
│   │   └── whois/route.ts      # GET: Live RDAP & WHOIS domain lookup route
│   ├── tld/[domain]/           # Dedicated SERP/SEO friendly TLD detail page (SSG)
│   │   └── page.tsx
│   ├── globals.css             # Tailwind v4 directives & theme configurations
│   ├── layout.tsx              # Root layout wrapped with ThemeProvider
│   ├── page.tsx                # Main single-page interface
│   ├── robots.ts               # Robots.txt generator
│   └── sitemap.ts              # Dynamic XML sitemap generator
├── components/                 # Client and Server React components
│   ├── tld-detail-client.tsx   # Interactive WHOIS checker, Google Calendar reminder & quick-copy widget
│   ├── domain-hacks.tsx        # UI card grid for domain hack suggestions
│   ├── search-form.tsx         # Search input, mode detection, protocol toggle, URL query sync
│   ├── tld-list.tsx            # TLD cards grid, WHOIS display & Google Calendar reminder
│   └── ui/                     # Native Material Design 3 UI primitives (popover, select, checkbox, tooltip, button, label, badge)
├── data/
│   ├── iana-tld.json           # Scraped index of all IANA TLDs
│   ├── iana-tld-details.json   # Scraped delegation details for 1,500+ TLDs
│   └── tlds.ts                 # TypeScript types and data accessor helpers
├── lib/
│   ├── domain-hacks.ts         # Domain hack generator library
│   ├── rdap.ts                 # RDAP protocol client
│   ├── site-config.ts          # Base URL configuration helper (NEXT_PUBLIC_BASE_URL)
│   └── utils.ts                # Utility functions
├── netlify/
│   └── functions/
│       └── trigger-build.js    # Netlify Scheduled Function (Bi-weekly build trigger)
├── scripts/
│   ├── scrape.js               # Web scraper for IANA master index
│   └── scrape-details.js       # Stealth scraper for individual IANA TLD detail pages
├── proxy.ts                    # Middleware enforcing CORS/Origin security
├── package.json                # Project dependencies and script declarations
└── README.md                   # User documentation and setup guide
```

---

## ⚙️ Development Commands

- **Local Dev Server**: `yarn dev` (starts Next.js with Turbopack on `http://localhost:3000`)
- **Build Application**: `yarn build` (executes `yarn scrape:all` then `next build`)
- **Scrape Index**: `yarn scrape` (scrapes IANA DB and updates `data/iana-tld.json`)
- **Scrape Details**: `yarn scrape:details` (stealth scrapes TLD details into `data/iana-tld-details.json`)
- **Scrape All**: `yarn scrape:all` (runs both index & detail scrapers)
- **Start Production**: `yarn start`
