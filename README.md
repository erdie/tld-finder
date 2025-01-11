
# TLD Finder

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