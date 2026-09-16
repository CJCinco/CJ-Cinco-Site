# CJ Cinco

Personal website for [cjcinco.com](https://cjcinco.com), built with Next.js and exported to Cloudflare Pages.

## Develop and verify

```sh
npm ci
npm run dev
npm run lint
npm run build
```

Cloudflare Pages project `cj-cinco-site` builds the `main` branch of `CJCinco/CJ-Cinco-Site` with `npm run build` and publishes `out/` to `cjcinco.com` and `www.cjcinco.com`. Preserve the existing email DNS configuration.

## Pages and editing

- The home page contains About, Tech Help, Sound, Healing, and an email footer. Copy and destinations live in `src/app/content.ts`.
- `src/app/site-header.tsx` and `globals.css` share the same fixed navigation geometry across pages: CJ Cinco, a centered hamburger, and Email. The menu groups the four home sections under Explore and Plants/Health Snapshot under Discover; Escape, outside focus/click and selecting a link close it.
- `/health-snapshot.html` presents the free one-page worksheet, its preview and an explicit PDF download. Source: `src/app/health-snapshot/`; printable assets: `public/downloads/`; editable builder: `scripts/build-health-snapshot.py`.
- `/plants.html` contains the ten-entry Plant Directory, search/filter controls, care details and user-initiated inquiries. Source: `src/app/plants/`; reference photos: `public/plants/`. CJ explicitly authorized publishing the full local site on September 15, 2026, superseding the earlier Plants hold. Availability, reference-photo rights and nursery-release facts remain unverified; existing no-index metadata and catalog safeguards remain unchanged. Publication does not establish verified sale inventory.
- Plant updates use the external private inventory and `npm run catalog:update`, followed by `npm run catalog:test`. Builds consume only the allowlisted `catalog.public.json`; private stock, buyer and reservation records must never enter this repository or export.

## Scroll artwork

`hero-rider.tsx`, `journey-player.ts`, `journey-scene.ts`, `rider-frames.ts`, `scroll-frames.ts`, `scroll-film.ts` and `image-loader.ts` own the decorative scene. Every position and frame follows measured absolute scroll, with no autoplay or recurring idle animation. Devices begin fading when the About body reaches their origin, then grow and depart down-right. On phones, the devices fan out into four readable silhouettes before their parallel departure. Sound exits down-left. Desktop healing settles at the center of the space beside its text; mobile retains its existing placement. Reduced motion and data-saving settings use a static layout. The former Pause motion button has been removed.

Delivery media contains the approved rider-v2 frames, Lucia-v6 frames, studio and background films, and required artwork. Public runtime JSON contains only dimensions and crop/frame geometry. Full original media, internal provenance and review packages remain preserved in the separate local candidate; they are not part of this release. Previously published fallback/brand assets remain preserved in the repository.

## Mobile Sound playback

Phones use `studio-frames-v1/mobile/`: 240 source-derived WebP frames at the original 30fps, with the same 640×360 composition, saturation and soft perimeter as the video. This keeps scrolling independent of native paused-video seekability. The bounded sequence loader blends adjacent frames, shares a two-request pool, and releases decoded neighbors outside Sound. Desktop still uses the existing MP4 controller and unchanged poses/spacing. The original mobile MP4 remains preserved.
