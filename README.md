# CJ Cinco Website

Next.js personal-brand site for `cjcinco.com`.

This project is separate from the live Vero Tech Care, Green Bodyworks, Aligned Harmonics, and Altered States sites. Those sites were used only as local/reference context and should not be merged into this project without a deliberate future change.

## Live URLs

```text
https://cjcinco.com
https://www.cjcinco.com
https://cj-cinco-site.pages.dev
```

GitHub repository:

```text
https://github.com/CJCinco/CJ-Cinco-Site
```

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL that Next.js prints, usually:

```text
http://localhost:3000
```

## Edit Text And Links

Most editable copy lives in:

```text
src/app/content.ts
```

Use that file to edit:

- Hero tagline and supporting line
- About bio
- Sound cards
- Venture cards and external links
- Contact email and social placeholders

The page implementation lives in:

```text
src/app/page.tsx
```

Global styles live in:

```text
src/app/globals.css
```

The original local hero visual is:

```text
public/visuals/cj-cinco-hero.png
```

Regenerate it with:

```bash
node scripts/generate-visuals.mjs
```

## Deploy With Cloudflare Pages

This site is configured as a static Next.js export for Cloudflare Pages.

Recommended Cloudflare Pages settings:

```text
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Production branch: main
```

Current Cloudflare Pages project:

```text
cj-cinco-site
```

Current production setup:

1. GitHub repo: `CJCinco/CJ-Cinco-Site`
2. Cloudflare Pages project: `cj-cinco-site`
3. Production branch: `main`
4. Build command: `npm run build`
5. Build output directory: `out`
6. Custom domains: `cjcinco.com`, `www.cjcinco.com`

Keep iCloud mail DNS records intact when adding or changing web records.

## Email DNS

`cjcinco.com` is configured in iCloud Custom Email Domain DNS through Cloudflare. Keep the iCloud MX, SPF TXT, Apple verification TXT, and DKIM CNAME records intact.

Do not commit secrets, private credentials, API keys, `.env` files, or unrelated local files.
