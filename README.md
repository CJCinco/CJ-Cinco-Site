# CJ Cinco Website

Local Next.js preview for `cjcinco.com`.

This project is separate from the live Vero Tech Care, Green Bodyworks, Aligned Harmonics, and Altered States sites. Those sites were used only as local/reference context. Do not deploy this site or alter those sites until CJ approves the preview.

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

After CJ approves the local preview:

1. Initialize Git if needed.
2. Commit the approved local version.
3. Push to GitHub, expected repo: `CJCinco/CJ-Cinco-Site`.
4. Connect that GitHub repo to Cloudflare Pages.
5. Add `cjcinco.com` and `www.cjcinco.com` as custom domains in Cloudflare Pages.
6. Keep iCloud mail DNS records intact when adding or changing web records.

Do not commit secrets, private credentials, API keys, `.env` files, or unrelated local files.
