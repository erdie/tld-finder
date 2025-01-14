
# TLD Finder
[![Netlify Status](https://api.netlify.com/api/v1/badges/2780d267-7fd3-42b0-b8d0-5005e2f3932d/deploy-status)](https://app.netlify.com/sites/hilarious-biscuit-90e43f/deploys)

![tld-finder-ss](https://github.com/user-attachments/assets/c6aa5ff8-2721-4126-b0ce-ed066bfa63dd)

Explore the world's top-level domains and uncover the organizations that manage them!

## Run the development server

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scrape the list of TLD extensions

```bash
pnpm scrape
```
Commit the changed files

```bash
git add data/iana-tld.json
git commit -m "your commit message"
```

## To do

- Implement a filter by domain extension, type, or TLD manager.
- Add an AI button next to the TLD manager to search for information about the registrar or company managing the domain extension.

## Learn more about Next.js

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
