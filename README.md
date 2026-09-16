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
- `src/app/site-header.tsx` and `globals.css` share the same fixed navigation geometry across pages.
- `/health-snapshot.html` presents the free one-page worksheet, its preview and an explicit PDF download. Source: `src/app/health-snapshot/`; printable assets: `public/downloads/`; editable builder: `scripts/build-health-snapshot.py`.
- The plant catalog remains in the separate local preview and is intentionally absent from this public release.

## Scroll artwork

`hero-rider.tsx`, `journey-player.ts`, `journey-scene.ts`, `rider-frames.ts`, `scroll-frames.ts`, `scroll-film.ts` and `image-loader.ts` own the decorative scene. Every position and frame follows measured absolute scroll, with no autoplay or recurring idle animation. Devices begin fading when the About body reaches their origin, then grow and depart down-right. Sound exits down-left. Desktop healing settles at the center of the space beside its text; mobile retains its existing placement. Reduced motion and data-saving settings use a static layout; Pause motion freezes the scene.

Delivery media contains the approved rider-v2 frames, Lucia-v6 frames, studio and background films, and required artwork. Public runtime JSON contains only dimensions and crop/frame geometry. Full original media, internal provenance and review packages remain preserved in the separate local candidate; they are not part of this release. Previously published fallback/brand assets remain preserved in the repository.
