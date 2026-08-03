# MEMORY.md - Project Knowledge Base & Technical Context

## 📌 Project Overview
**TLD Finder** (`tld-finder`) is a modern, responsive Jamstack web application designed to explore top-level domains (TLDs) from the IANA Root Zone, provide AI-powered insights into TLD registry managers via Google Gemini, and perform live, real-time WHOIS lookups and domain availability checks.

- **Production URL**: Netlify deployed Jamstack app (`https://tld-finder.erdiawan.com` / `https://tldfinder.app`)
- **Primary Repository Workspace**: `/Users/erdi/Data/Codes/tld-finder`

---

## 🛠️ Tech Stack & Architecture

### Core Framework & Runtime
- **Framework**: Next.js 16.1.6 (React 19, Next.js App Router, Turbopack enabled for dev mode)
- **Language**: TypeScript 5, Node.js (v20 runtime target)
- **Package Manager**: Yarn (`yarn.lock`)

### Frontend & Styling
- **CSS Framework**: Tailwind CSS v4 (`@tailwindcss/postcss` ^4.0.0, PostCSS ^8)
- **UI Design System**: Radix UI primitives (`@radix-ui/react-checkbox`, `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`)
- **Utility Libraries**: `class-variance-authority` (CVA), `clsx`, `tailwind-merge`
- **Theming**: `next-themes` (Dark / Light mode support)
- **Iconography**: `lucide-react`

### AI & Data Engine
- **Gemini AI Integration**: `@google/generative-ai` (^0.21.0) querying `gemini-3.5-flash-lite` (with fallback to `gemini-3.1-flash-lite` and `gemini-2.5-flash-lite`) for real-time, concise Markdown overviews of TLD registry managers.
- **WHOIS Engine**: `whoiser` (^2.0.0-beta.10) for serverless WHOIS queries, parsing domain registration dates, registrar metadata, name servers, status, and raw logs.
- **Web Scraper**: Node.js script using `got` (^14.4.5) & `jsdom` (^26.0.0) to scrape the official IANA Root Zone Database.

### Hosting & Infrastructure
- **Platform**: Netlify (Serverless API Routes & Scheduled Functions)
- **Automated Data Maintenance**: Netlify Scheduled Function (`netlify/functions/trigger-build.js`) configured with cron (`0 0 1,15 * *`) to auto-trigger a Netlify Build Hook, re-scraping IANA domain records statically before `next build`.

---

## 🚀 Key Features

1. **IANA Root Database Explorer**
   - Instant search across 1,500+ top-level domains by extension (e.g. `.com`, `.ai`, `.id`) or registry operator name.
   - Filtering by TLD classification: Generic (`gTLD`), Country Code (`ccTLD`), or Sponsored (`sTLD`).
   - Granular search scope checkboxes (By Extensions, By Managers).

2. **Gemini AI Registry Insights (`gemini-3.5-flash-lite`)**
   - On-demand AI summary generation for any TLD registry manager.
   - Provides background on the organization type (non-profit, commercial, government, university) and links to their official website.

3. **Live WHOIS & Domain Availability Lookup**
   - Automatic input detector: queries containing a dot and valid hostname (e.g. `example.com`) switch dynamically into Domain WHOIS Mode.
   - Real-time status indication: Registered (blue indicator) vs Available for registration (green pulsing indicator).
   - Metrics display: Registrar, Creation date, Expiry date (with active days remaining countdown and close-to-expiration warning), Updated date, Name Servers, Domain Status tags.
   - Integrated dark terminal drawer for raw WHOIS output with one-click copy-to-clipboard functionality.

4. **Deep Linking & URL Query Sync**
   - Synchronizes search state with URL search parameters (`?domain=...` or `?q=...`) for instant sharing and bookmarking.

5. **Automated Bi-weekly Data Pipeline**
   - Netlify Scheduled Function triggers a build hook on the 1st and 15th of every month (`0 0 1,15 * *`).
   - The build process runs `npm run scrape` before `next build`, keeping static data fresh without manual intervention.

6. **Security & API Request Proxy**
   - Custom proxy middleware (`proxy.ts`) verifying `Origin` and `Referer` headers against allowed domains (`tld-finder.erdiawan.com`, `tldfinder.app`, `localhost:3000`) for protected routes (`/api/ai-info`, `/api/tld`).

---

## 📁 Project Structure

```
tld-finder/
├── app/                        # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── ai-info/route.ts    # POST: Gemini AI 2.5 Flash TLD manager lookup
│   │   ├── tld/route.ts        # GET: Filtered TLD list query endpoint
│   │   └── whois/route.ts      # GET: Live WHOIS domain lookup using whoiser
│   ├── globals.css             # Tailwind v4 directives & theme configurations
│   ├── layout.tsx              # Root layout wrapped with ThemeProvider
│   └── page.tsx                # Main single-page interface
├── components/                 # Client and Server React components
│   ├── search-form.tsx         # Search input, mode detection, filter controls, URL sync
│   ├── tld-list.tsx            # TLD cards grid, AI info trigger, WHOIS results display
│   ├── github-star.tsx         # GitHub repository badge link
│   ├── theme-provider.tsx      # Next-themes wrapper
│   ├── theme-toggle.tsx        # Dark/Light mode toggle button
│   └── ui/                     # Radix UI primitives (badge, button, checkbox, input, select, etc.)
├── data/
│   ├── iana-tld.json           # Scraped static database of all IANA TLDs
│   └── tlds.ts                 # TypeScript types and export wrapper for iana-tld.json
├── lib/
│   └── utils.ts                # Utility functions (clsx + tailwind-merge helper)
├── netlify/
│   └── functions/
│       └── trigger-build.js    # Netlify Scheduled Function (Bi-weekly build trigger)
├── scripts/
│   └── scrape.js               # Web scraper for https://www.iana.org/domains/root/db
├── proxy.ts                    # Middleware enforcing CORS/Origin security on protected APIs
├── .env.local                  # Environment variables (GEMINI_API_KEY, NETLIFY_BUILD_HOOK_URL)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── package.json                # Project dependencies and script declarations
└── README.md                   # User documentation and setup guide
```

---

## 🔑 Environment Variables

| Variable Key | Description | Usage |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | Required for `/api/ai-info` route (`gemini-3.5-flash-lite` with fallback to `gemini-3.1-flash-lite` & `gemini-2.5-flash-lite`) |
| `NETLIFY_BUILD_HOOK_URL` | Netlify Build Webhook URL | Required by `netlify/functions/trigger-build.js` for bi-weekly automated scraping |

---

## ⚙️ Development Commands

- **Local Dev Server**: `yarn dev` (starts Next.js with Turbopack on `http://localhost:3000`)
- **Build Application**: `yarn build` (executes `npm run scrape` then `next build`)
- **Manual Data Scrape**: `yarn scrape` (scrapes IANA DB and updates `data/iana-tld.json`)
- **Start Production**: `yarn start`
