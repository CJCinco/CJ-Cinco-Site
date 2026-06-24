import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outputDir = path.join(process.cwd(), "public", "visuals");
fs.mkdirSync(outputDir, { recursive: true });

const heroSvg = `
<svg width="1800" height="1200" viewBox="0 0 1800 1200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="gold" cx="26%" cy="28%" r="62%">
      <stop offset="0%" stop-color="#f4d789" stop-opacity="0.9"/>
      <stop offset="48%" stop-color="#b67349" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="#080806" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="teal" cx="76%" cy="34%" r="52%">
      <stop offset="0%" stop-color="#75d2bb" stop-opacity="0.78"/>
      <stop offset="52%" stop-color="#185d59" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#080806" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ember" cx="52%" cy="82%" r="54%">
      <stop offset="0%" stop-color="#d78058" stop-opacity="0.64"/>
      <stop offset="55%" stop-color="#753325" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#080806" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12100d"/>
      <stop offset="46%" stop-color="#070706"/>
      <stop offset="100%" stop-color="#13100b"/>
    </linearGradient>
    <filter id="soften">
      <feGaussianBlur stdDeviation="20"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.76" numOctaves="4" seed="23"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.16"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="1800" height="1200" fill="url(#veil)"/>
  <rect width="1800" height="1200" fill="url(#gold)"/>
  <rect width="1800" height="1200" fill="url(#teal)"/>
  <rect width="1800" height="1200" fill="url(#ember)"/>
  <g filter="url(#soften)" opacity="0.78">
    <path d="M-160 848 C 244 574, 459 1062, 806 756 S 1372 418, 1978 668" fill="none" stroke="#efe0b8" stroke-width="8" stroke-opacity="0.32"/>
    <path d="M-120 698 C 254 498, 518 840, 890 636 S 1374 276, 1936 448" fill="none" stroke="#74c9b5" stroke-width="6" stroke-opacity="0.26"/>
    <path d="M-142 944 C 292 732, 514 1026, 884 852 S 1414 644, 1950 766" fill="none" stroke="#cf7556" stroke-width="7" stroke-opacity="0.2"/>
  </g>
  <g opacity="0.24">
    <circle cx="1196" cy="280" r="256" fill="none" stroke="#f4efe3" stroke-width="1.5"/>
    <circle cx="1196" cy="280" r="160" fill="none" stroke="#d8b45f" stroke-width="1"/>
    <circle cx="1196" cy="280" r="72" fill="none" stroke="#6fb7a7" stroke-width="1"/>
  </g>
  <g opacity="0.34">
    <path d="M120 214 h260 M120 260 h360 M120 306 h230" stroke="#f4efe3" stroke-width="2"/>
    <path d="M1420 868 h210 M1368 916 h326 M1488 964 h176" stroke="#f4efe3" stroke-width="2"/>
  </g>
  <rect width="1800" height="1200" fill="url(#veil)" opacity="0.24"/>
  <rect width="1800" height="1200" filter="url(#grain)" opacity="0.36"/>
</svg>`;

await sharp(Buffer.from(heroSvg))
  .resize(1800, 1200)
  .png({ compressionLevel: 9, quality: 90 })
  .toFile(path.join(outputDir, "cj-cinco-hero.png"));

console.log("Generated public/visuals/cj-cinco-hero.png");
