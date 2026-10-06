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

- The CJC-448 one-page homepage uses the existing VTC portrait, a compact centered introduction beginning “I’m CJ” around Tech Support, Digital Setup, and Online Presence, two centered, vertically stacked main buttons beneath the introduction: Vero Tech Care to `https://verotechcare.com/` and Email me to `energy@cjcinco.com`. CJ selected this option on October 6. One quiet Download Health Snapshot button below the main buttons downloads `/downloads/cj-cinco-health-snapshot.pdf` directly with the HTML download attribute, keeping the visitor on the landing page. There is no resource preview/listening section, separate business-email button or copyright footer. It has no header, navigation bar, large heading, location label or plant promotion. Portrait source: `/Users/cjcinco/AOS/05 Vero Tech Care/02 Website/cj-brand-pic.png`; the local `public/cj-brand-pic.png` is an exact byte copy. Copy and destinations live in `src/app/content.ts`; its scoped styling is `src/app/minimal-home.module.css`. CJ approved publishing this exact homepage on October 6, 2026; the release receipt owns deployment/readback proof. Historical copy, scene code and all media remain preserved. Old `#home`, `#about`, `#tech-help`, `#sound`, `#healing` and `#email` links retain destinations; the former healing and sound anchors now lead to the personal email button.
- `src/app/site-header.tsx` and `globals.css` preserve the historical resource-page navigation source. Only the integration policy uses that header in the public export; the homepage has no navigation. `/privacy.html` remains intact for existing policy/integration references; CJ requested removing its landing-page footer link on October 6.
- Old `/health-snapshot`, `/health-snapshot.html` and trailing-path links redirect directly to the existing PDF. The former resource page is excluded from export; its source and preview remain preserved locally. Source: `src/app/health-snapshot/`; printable assets: `public/downloads/`; editable builder: `scripts/build-health-snapshot.py`.
- The former Plants page is excluded from export. `/plants`, `/plants.html` and trailing/item paths redirect to `/#email`, preserving a contact destination for seven recorded Marketplace incoming links. CJC-404 owns external listings and inventory; CJ said he will take down listings, and no external takedown is claimed. Catalog source, plant media and private inventory remain in their existing owners. Do not infer sale availability or invent retirement of external listings.
- Plant updates use the external private inventory and `npm run catalog:update`, followed by `npm run catalog:test`. Builds consume only the allowlisted `catalog.public.json`; private stock, buyer and reservation records must never enter this repository or export.

## Preserved scroll artwork

The one-page homepage does not mount this scene or request its motion media. The previous home implementation remains in Git history. Do not delete preserved source or media as part of the identity transition. Review only the CJC-448 changed-file set for release; unrelated video-script edits and untracked plant images are not included by approval of this candidate. `npm run build` runs `scripts/prepare-single-page-export.mjs` after Next export. It allowlists generated home/error/framework files, the portrait, redirects, direct PDF and existing integration policy; it excludes old plant/resource-page output and unused public motion/plant media. Only generated `out/` artifacts are pruned, never source. Release from a clean, explicitly selected source tree so unrelated working changes cannot enter the build. Cloudflare uses `public/_redirects` for old incoming links. All later deployments still require explicit approval.

`hero-rider.tsx`, `journey-player.ts`, `journey-scene.ts`, `rider-frames.ts`, `scroll-frames.ts`, `scroll-film.ts` and `image-loader.ts` own the decorative scene. Every position and frame follows measured absolute scroll, with no autoplay or recurring idle animation. Devices begin fading when the About body reaches their origin, then grow and depart down-right. On phones, the devices fan out into four readable silhouettes before their parallel departure. Sound exits down-left. Desktop healing settles at the center of the space beside its text; mobile retains its existing placement. Reduced motion and data-saving settings use a static layout. The former Pause motion button has been removed.

Delivery media contains the approved rider-v2 frames, Lucia-v6 frames, studio and background films, and required artwork. Public runtime JSON contains only dimensions and crop/frame geometry. Full original media, internal provenance and review packages remain preserved in the separate local candidate; they are not part of this release. Previously published fallback/brand assets remain preserved in the repository.

## Mobile Sound playback

Phones use `studio-frames-v1/mobile/`: 240 source-derived WebP frames at the original 30fps, with the same 640×360 composition, saturation and soft perimeter as the video. This keeps scrolling independent of native paused-video seekability. The bounded sequence loader blends adjacent frames, shares a two-request pool, and releases decoded neighbors outside Sound. Desktop still uses the existing MP4 controller and unchanged poses/spacing. The original mobile MP4 remains preserved.
