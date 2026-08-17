# TLD Finder
[![Netlify Status](https://api.netlify.com/api/v1/badges/2780d267-7fd3-42b0-b8d0-5005e2f3932d/deploy-status)](https://app.netlify.com/sites/hilarious-biscuit-90e43f/deploys)

Explore the world's top-level domains, uncover the organizations that manage them, view complete IANA delegation records, perform live, high-performance WHOIS & RDAP queries on any domain name, and schedule domain expiration reminders!

TLD Finder is a modern, responsive Jamstack application built on **Next.js 16** (App Router) and deployed natively on **Netlify** serverless infrastructure.

---

## 🚀 Key Features

* **IANA Root Database Explorer**: Instantly search and filter through all 1,500+ registered top-level domains (TLDs) in the official IANA Root Zone by extension (e.g. `.com`, `.ai`, `.id`) or registry operator name.
* **Green Material Design 3 (M3 / Material You) System**:
  * Forest Emerald & Mint tonal palette adhering to the latest official M3 design token guidelines (`#006d3a` light / `#74da96` dark).
  * Authentic M3 **borderless filled cards** utilizing soft tonal surface containers (`surface-container-low` / `surface-container-high`).
  * Custom M3 **wavy / squiggly border dividers** (`<WavyDivider />`) with repeating sine-wave vector rendering.
  * Universal browser autofill background reset eliminating browser autocomplete highlight boxes.
* **Agentic Browsing & WebMCP (Web Model Context Protocol)**:
  * **Declarative WebMCP Form Coverage**: Annotated search and lookup forms with `toolname="search_tlds"`, `toolname="lookup_domain_whois_rdap"`, and descriptive `toolparamdescription` attributes for autonomous AI browser interaction.
  * **Imperative WebMCP Tools (`document.modelContext`)**: Client-side registered tools (`search_tlds`, `lookup_domain`, `generate_domain_hacks`) with strict JSON Schemas for direct execution by AI agents (e.g. Chrome 150+).
  * **`llms.txt` & `llms-full.txt` (llmstxt.org)**: Standard-compliant Markdown summaries and structured API catalogues for AI crawlers and LLM-based navigation.
* **Ultra-Fast Instant Search & Core Web Vitals Optimization**:
  * **0ms Latency In-Memory Filtering**: Searches across all 1,500+ TLDs directly in-memory with zero network latency, instant keystroke feedback, and zero layout shifts (CLS = 0).
  * **Offscreen Content Rendering (`content-visibility: auto`)**: Leverages modern CSS `content-visibility` and `contain-intrinsic-size` on list items to defer offscreen layout and paint calculations, keeping DOM operations 120fps smooth.
  * **Self-Hosted Material Symbols Font**: Self-hosted WOFF2 font with `font-display: swap` and high-priority `<link rel="preload">` eliminating FOUT and layout shifts.
  * **Legacy JS Elimination**: Stripped redundant legacy polyfills (Array.at, Object.hasOwn, etc.) for modern Baseline browser targets saving ~13 KiB.
  * **Edge Caching & S-Maxage Headers**: API endpoints equipped with `Cache-Control` (`s-maxage` and `stale-while-revalidate`) for rapid edge responses.
* **Comprehensive SERP & SEO Infrastructure**:
  * **Static Site Generation (SSG)** for all 1,600+ top-level domains pre-rendering full semantic HTML for search engines.
  * **Rich Structured Data (JSON-LD)**: Schema.org `BreadcrumbList`, `WebPage`, `WebSite` (with `SearchAction`), `WebApplication`, and `DataCatalog` knowledge graphs.
  * **Complete Social & Viewport Meta**: OpenGraph, Twitter Large Summary Cards, canonical URLs, and dynamic light/dark `theme-color` viewport tags.
* **Browser-Mimicking Stealth Scraper (`scripts/scrape-details.js`)**:
  * Scrapes individual IANA TLD delegation pages (`https://www.iana.org/domains/root/db/{domain}.html`) with stealth protections to prevent anti-scraping blocks.
  * Features User-Agent rotation, realistic browser HTTP navigation headers (`Sec-Fetch-*`, `Sec-Ch-Ua`, `Accept-Language`, `Referer`), jitter delays, rate-limit throttling, and IDN Punycode conversion (`domainToASCII`).
  * Saves structured records locally to `data/iana-tld-details.json` with resumable progress caching.
* **Gemini AI Registry Insights**: Harnesses Google's `gemini-3.5-flash-lite` model (with dynamic fallbacks) to fetch real-time, concise Markdown summaries about registry operators.
* **Live Domain WHOIS & RDAP Lookup**: 
  * Automatically detects domain queries (e.g., `erdiawan.com`) and queries RDAP bootstrap servers with automatic fallback to traditional WHOIS (`whoiser`).
  * Real-time status display: **Registration Availability** (green pulsing indicator) vs **Registered Status** (emerald indicator).
  * Key metrics: Registrar info, DNS Nameservers, Status badges, and active countdown of days remaining until expiration.
  * Includes a toggleable **Raw WHOIS/RDAP Record** dark terminal block with instant copy-to-clipboard actions.
* **Google Calendar Expiration Reminders ("Remind Me")**:
  * Integrated **Remind Me** button for registered domain WHOIS/RDAP lookups.
  * Automatically calculates event date **30 days prior to domain expiration** at **09:00 AM WIB / Jakarta (GMT+7)**.
  * Mobile-responsive layout (positioned on the right on mobile views and on the left on desktop views).
* **Deep Linking / URL Query String Sync**:
  * Automatically synchronizes search queries to the URL (`?domain=domainname.com` or `?q=...`) for instant deep linking and sharing.
  * Cleans input prefixes (`https://`, `www.`) automatically and supports browser `popstate` Back/Forward history navigation.
* **Domain Hack Generator**: Split-word algorithm generating creative domain hacks for any keyword (e.g., `antigravity` ➔ `anti.gr/avity`, `antigra.vi/ty`, `antigrav.it/y`).
* **Automated Bi-weekly Data Pipeline**: A Netlify Scheduled Function (`0 0 1,15 * *`) triggering a build hook to auto-scrape, compile, and statically deploy the latest TLD records from IANA.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 16 (React 19 & Next.js App Router with Turbopack)
* **Language**: TypeScript 5
* **Styling**: Tailwind CSS v4 + PostCSS
* **Design System**: Native Material Design 3 (M3 / Material You) pure component system (Popovers, Selects, Checkboxes, Tooltips, Buttons, Labels, Badges, Chips & Wavy Dividers) with soft forest & mint tonal palettes
* **Iconography**: Google Material Symbols (`material-symbols`)
* **Hosting**: Netlify (App Router Serverless Functions & Scheduled Functions)

---

## 📁 Project Structure

```
tld-finder/
├── app/                        # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── ai-info/route.ts    # POST: Gemini AI TLD manager lookup
│   │   ├── domain-hacks/route.ts# GET: Split-word domain hack generator endpoint
│   │   ├── tld/route.ts        # GET: Filtered TLD list endpoint
│   │   └── whois/route.ts      # GET: Live RDAP & WHOIS domain lookup route
│   ├── tld/[domain]/           # Dedicated SERP/SEO friendly TLD detail page
│   │   └── page.tsx            # Static pre-rendered detail view (SSG)
│   ├── globals.css             # Tailwind v4 directives, M3 tonal color tokens & autofill reset
│   ├── layout.tsx              # Root layout wrapped with ThemeProvider & base JSON-LD
│   ├── page.tsx                # Main search & TLD explorer page
│   ├── robots.ts               # Search engine crawler directive rules
│   └── sitemap.ts              # Dynamic XML sitemap generator (includes all /tld/[domain] paths)
├── components/                 # Client and Server React components
│   ├── ai-registry-popover.tsx # Gemini AI powered registry insights popover
│   ├── domain-hacks.tsx        # UI card grid for displaying domain hacks
│   ├── search-form.tsx         # Search input, mode detection, protocol toggle, URL query sync
│   ├── site-footer.tsx         # Reusable M3 footer with wavy divider & SM typography
│   ├── theme-provider.tsx      # Dark/Light theme provider wrapper
│   ├── theme-toggle.tsx        # M3 animated light/dark toggle button
│   ├── tld-detail-client.tsx   # Interactive WHOIS checker, Google Calendar reminder & quick-copy widget
│   ├── tld-list.tsx            # TLD cards grid, WHOIS result display & Google Calendar reminder
│   └── ui/                     # Native Material Design 3 UI primitives (popover, select, checkbox, tooltip, button, label, badge, wavy-divider)
├── data/
│   ├── iana-tld.json           # Scraped index of all IANA TLDs
│   ├── iana-tld-details.json   # Scraped delegation details for 1,500+ TLDs
│   └── tlds.ts                 # TypeScript types and data accessor helpers
├── lib/
│   ├── domain-hacks.ts         # Domain hack generator library
│   ├── rdap.ts                 # RDAP protocol client
│   ├── site-config.ts          # Centralized configuration helper (NEXT_PUBLIC_BASE_URL)
│   └── utils.ts                # Utility functions
├── scripts/
│   ├── scrape.js               # Web scraper for IANA master index (iana.org/domains/root/db)
│   └── scrape-details.js       # Stealth scraper for individual IANA TLD detail pages
├── netlify/
│   └── functions/
│       └── trigger-build.js    # Netlify Scheduled Function (Bi-weekly build trigger)
├── proxy.ts                    # CORS/Origin security middleware
└── package.json                # Project dependencies and script declarations
```

---

## 💻 Local Setup & Development

Ensure you have dependencies installed (configured for Yarn):

```bash
# Install dependencies
yarn install

# Run the local development server (with Next.js Turbopack)
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Data Scraping Commands

To manually refresh IANA top-level domain records:

```bash
# 1. Scrape master TLD index list (data/iana-tld.json)
yarn scrape

# 2. Stealth-scrape detailed delegation records for all TLDs (data/iana-tld-details.json)
yarn scrape:details

# Target a specific domain only:
node ./scripts/scrape-details.js --tld=ai

# 3. Scrape both index and details in sequence:
yarn scrape:all
```

---

## ⚙️ Environment Configuration

Configure environment variables in `.env.local` or **Netlify Site Configuration > Environment variables**:

| Variable Key | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_BASE_URL` | Public Base URL for canonical tags, OpenGraph, sitemap, and CORS allowed origins | `tld-finder.erdiawan.com` or `https://tld-finder.erdiawan.com` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `NETLIFY_BUILD_HOOK_URL` | Netlify build webhook URL for automated bi-weekly builds | `https://api.netlify.com/build_hooks/...` |

### Bi-weekly Automated Pipeline Setup
1. In **Netlify Dashboard** > **Site Configuration** > **Build & deploy** > **Build hooks**, click **Add build hook**.
2. Name it `Bi-weekly Scraper Trigger`, target the `main` branch, and click **Save**.
3. Save the webhook URL into `NETLIFY_BUILD_HOOK_URL`.
4. On deployment, [`netlify/functions/trigger-build.js`](netlify/functions/trigger-build.js) will fire on the 1st and 15th of every month (`0 0 1,15 * *`), executing `yarn scrape:all && next build` to deploy fresh static data automatically!
