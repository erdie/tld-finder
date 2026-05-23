# TLD Finder
[![Netlify Status](https://api.netlify.com/api/v1/badges/2780d267-7fd3-42b0-b8d0-5005e2f3932d/deploy-status)](https://app.netlify.com/sites/hilarious-biscuit-90e43f/deploys)

Explore the world's top-level domains, uncover the organizations that manage them, and perform live, high-performance WHOIS queries on any fully qualified domain name!

TLD Finder is a modern, responsive Jamstack application built on **Next.js** and deployed natively on **Netlify** serverless infrastructure.

---

## 🚀 Key Features

* **IANA Root Database Explorer**: Instantly search and filter through all registered top-level domains (TLDs) in the IANA Root Zone.
* **Gemini AI Registry Insights**: Harnesses Google's `gemini-2.5-flash` model to fetch real-time, concise, and highly engaging details about the registry operator for any TLD at the click of a button.
* **Live Domain WHOIS & Availability Lookup**: 
  * Automatically detects fully-qualified domain queries (e.g., `erdiawan.com`) in the search bar.
  * Dynamically queries registry and registrar servers using `whoiser`.
  * Features a gorgeous visual display showcasing **Registration Availability** (green pulsing indicator) vs **Registered Status** (blue indicator).
  * Includes crucial metrics: Registrar info, DNS Nameservers, Status badges, and an **active countdown of days remaining until expiration** (which highlights in red when close to expiring).
  * Includes a toggleable **Raw WHOIS Record** dark terminal block with instant copy-to-clipboard actions.
* **Weekly Automated Database Scraper**: A Netlify Scheduled Function running weekly (`@weekly`) that triggers a Netlify Build Hook to auto-scrape, compile, and statically deploy the latest TLD registries from the IANA Root Zone.
* **Deep Linking / URL Parameter Sync**: Automatically updates the browser query string (`?domain=...` or `?q=...`) for instant deep linking, page refreshes, or query sharing.

---

## 🛠️ Tech Stack

* **Frontend Framework**: Next.js 16.1.6 (utilizing React 19 & Next.js App Router)
* **Styling**: Tailwind CSS v4 + PostCSS
* **Serverless Infrastructure**: Netlify Functions (Node.js API routes & background Scheduled Functions)
* **Design Systems**: Radix UI Primitives (Checkbox, Select, Tooltip, Label, Slot) and CVA
* **Query Libraries**: `whoiser` for live WHOIS querying
* **Iconography**: Lucide React

---

## 💻 Local Setup & Development

First, ensure you have dependencies installed (configured for Yarn):

```bash
# Install dependencies
yarn install

# Run the local development server (with Next.js Turbopack)
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Scrape the List of TLD Extensions Manually

To manually fetch the latest TLD extensions from IANA and write them locally to `data/iana-tld.json`:

```bash
yarn scrape
```

---

## ⚙️ Environment Configuration

To support Gemini AI lookups and weekly auto-scraping cron jobs, configure the following environment variables in your local `.env.local` or **Netlify Site Configuration > Environment variables**:

| Variable Key | Description | Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Your Google Gemini API Key | `AIzaSy...` |
| `NETLIFY_BUILD_HOOK_URL` | Netlify build webhook URL to trigger weekly auto-scrape | `https://api.netlify.com/build_hooks/...` |

### Setting up the Weekly Automated Scraper
1. Go to your **Netlify Dashboard** > **Site Configuration** > **Build & deploy** > **Build hooks**.
2. Click **Add build hook**, set the name to `Weekly Scraper Trigger`, choose the `main` branch, and click **Save**.
3. Copy the generated URL and save it as the `NETLIFY_BUILD_HOOK_URL` environment variable.
4. Deploy the main branch. Netlify will automatically detect the cron configuration in [`netlify/functions/trigger-build.js`](netlify/functions/trigger-build.js) and run the build weekly, pulling and deploying the latest TLDs automatically!
