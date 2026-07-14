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

## Private Dashboard

The private CJ Cinco web dashboard lives at:

```text
/dashboard
```

It is intentionally not linked from the public homepage, nav, or footer. The route is built into the same static Cloudflare Pages deployment, but it should be protected in Cloudflare Zero Trust / Access with One-Time PIN for CJ's approved email before use.

Generate the privacy-redacted mirror of the canonical local AOS dashboard:

```bash
npm run generate:dashboard
```

Verify the generated data is current:

```bash
npm run verify:dashboard
```

Run the named privacy gate:

```bash
npm run verify:dashboard:privacy
```

Cloudflare builds validate the already-generated, committed dashboard package without trying to read the private Aligned OS folder:

```bash
npm run verify:dashboard:committed
```

Refresh and source-parity checks remain local-only. Commit the generated redacted package before pushing; the remote build intentionally does not regenerate it.

Source and generated files:

```text
dashboard-source/web-dashboard.json
public/dashboard/*.html
public/dashboard/assets/
public/_headers
docs/private-dashboard-cloudflare-access.md
```

`dashboard-source/web-dashboard.json` is a small redaction manifest, not a second dashboard data store. The generator treats the local generated dashboard package as the sole structural source. It preserves the original page set, navigation, DOM, CSS, JavaScript, labels, counts, chart structure, and ordering, then masks sensitive leaf values before anything enters this repository. It does not add CJ Cinco website, access-plan, privacy-card, coaching, or system UI to the dashboard.

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
