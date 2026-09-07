# CJ Cinco

A lightweight personal website for [cjcinco.com](https://cjcinco.com), built with Next.js and exported as a static site for Cloudflare Pages.

The single page includes About, Tech Help, Sound, and Healing, followed by an email footer. A silent abstract film advances with ordinary page scrolling. The hero sits in a translucent panel; content remains in normal document flow.

## Development

```bash
npm ci
npm run dev
```

## Validation and deployment

```bash
npm run lint
npm run build
```

The static output is `out/`. Cloudflare Pages project `cj-cinco-site` builds the `main` branch of `CJCinco/CJ-Cinco-Site` with `npm run build` and publishes `out/` to `cjcinco.com` and `www.cjcinco.com`. Website releases should preserve the existing email DNS configuration.

## Editing

- `src/app/content.ts`: biography, section copy, destinations, and email.
- `src/app/page.tsx`: page structure and image placement.
- `src/app/globals.css`: responsive layout and typography.
- `src/app/hero-video.tsx`: decorative background and scroll seeking.
- `public/visuals/`: portrait, brand logos, videos, and poster.

About uses the same body typography as the other sections. Tech Help leads with small-business support. Sound describes production and audio engineering, with interests in trap, meditation, healing, and workout music. Each work section has one plain link; the footer provides the email address.

## Motion and accessibility

The background uses the real page scroll range without pinning content or inserting video-only space. Video stays muted and paused while its current frame follows scrolling. Desktop and mobile have separate H.264 assets, encoded with every frame as a keyframe and fast-start metadata.

All text is server rendered. Reduced motion, data-saving preferences, very slow connections, disabled JavaScript, or a failed video retain a static poster. Native keyboard navigation, visible focus styles, and ordinary section links are preserved.

## Reproducing the film

The checked-in film was generated locally with [ltx-2-mlx](https://github.com/dgrauet/ltx-2-mlx) 0.15.2, pinned to commit `91e6f6c9bd621ff2ae31adfee643e113d67d6ae8`.

Pinned model sources:

- [LTX-2.3 MLX q8](https://huggingface.co/dgrauet/ltx-2.3-mlx-q8), revision `6671a7572a530862d1d60ce393b5d93491e3f76b`.
- [Gemma 3 12B 4-bit encoder](https://huggingface.co/mlx-community/gemma-3-12b-it-4bit), revision `86cc6a8dedbc456dd0e4af01a9d09f396f77e558`.

Model weights are not included. Preserve and follow the licenses supplied by the runner and each model source. The runner uses MIT terms; the models retain their LTX Community and Gemma terms.

Use an external working directory for weights, caches, and original renders. The scripts default to `~/LocalAI/cjc-365`; override it with `CJ_VIDEO_HOME`. The selected render has 145 frames at 24 fps, 1152×640 resolution, seed 365, and a duration of about six seconds.

```bash
export CJ_VIDEO_HOME="$HOME/LocalAI/cjc-365"
# Initial setup only; reuse the existing checkout when available.
git clone https://github.com/dgrauet/ltx-2-mlx.git "$CJ_VIDEO_HOME/ltx-2-mlx"
git -C "$CJ_VIDEO_HOME/ltx-2-mlx" checkout --detach 91e6f6c9bd621ff2ae31adfee643e113d67d6ae8
uv sync --project "$CJ_VIDEO_HOME/ltx-2-mlx" --frozen --no-dev --python 3.12
"$CJ_VIDEO_HOME/ltx-2-mlx/.venv/bin/python" scripts/download-video-models.py
"$CJ_VIDEO_HOME/ltx-2-mlx/.venv/bin/python" scripts/render-hero-video.py music-journey-01
"$CJ_VIDEO_HOME/ltx-2-mlx/.venv/bin/python" scripts/prepare-hero-video.py "$CJ_VIDEO_HOME/renders/music-journey-01.mp4"
```

Rendering runs offline after model download under a 90 GiB MLX memory cap. The scripts refuse to overwrite existing renders or prepared assets. Use a new named settings entry and output for another candidate. Prompts and render settings live in `scripts/hero-render-settings.json`; encoding settings, asset sizes, and SHA-256 hashes are in `scripts/hero-video-provenance.json`.

The original `public/visuals/cj-cinco-hero.png` remains preserved. Do not commit credentials, environment files, model weights, caches, or raw working material.
