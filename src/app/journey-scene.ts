import riderCrops from "../../public/visuals/resonance/rider-crops.json";

export const clamp = (n: number) => Math.min(1, Math.max(0, n));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export type JourneyProgress = { rider: number; riderStartBottom?: number; healingCenterX?: number; tech: number; sound: number; healing: number; whole: number; readingRight?: boolean };
export type Art = HTMLImageElement | HTMLCanvasElement;
export type JourneyImages = { field?: HTMLImageElement; film?: HTMLVideoElement; studio?: Art; light?: Art; devices?: Art; studioFilm?: HTMLVideoElement; studioFrames?: HTMLCanvasElement; lightFrames?: HTMLCanvasElement };
const decodedFilmFrames = new WeakMap<HTMLVideoElement, HTMLCanvasElement>();
export const devices = [
  { name: "tablet", crop: [720, 45, 465, 565], delay: 0, duration: 1, growth: 1.5, x: -.018, y: -.025, size: .42, distance: 1.20 },
  { name: "phone", crop: [170, 670, 295, 500], delay: .02, duration: .98, growth: 1.05, x: .018, y: -.01, size: .33, distance: 1.90 },
  { name: "laptop", crop: [30, 65, 670, 525], delay: .01, duration: .99, growth: 1.25, x: -.01, y: .025, size: .55, distance: 1.55 },
  { name: "router", crop: [640, 665, 585, 515], delay: .03, duration: .97, growth: 1.8, x: .02, y: .025, size: .27, distance: 2.25 },
];

// Export 039 is zero-based: source.firstFrameOneBased (65) + 39 = source 104.
export function frameAt() { return riderCrops.find(f => f.frame === 39)!; }

/** Runtime compositing only: source RGB files remain untouched. Remove only the
 * near-black region connected to the image boundary, never enclosed dark screens.
 * Studio uses an irregular soft perimeter because the original photo is cropped.
 * This work runs once per load, not on animation frames. */
export function prepareArt(image: HTMLImageElement, kind: "devices" | "studio" | "light") {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return image;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = pixels, w = canvas.width, h = canvas.height;
  if (kind === "studio") {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = x / (w - 1), ny = y / (h - 1);
      const left = smooth(nx / (.12 + .028 * Math.sin(ny * 11)));
      const right = smooth((1 - nx) / (.14 + .045 * Math.sin(ny * 8)));
      const top = smooth(ny / (.09 + .035 * Math.cos(nx * 10)));
      const bottom = smooth((1 - ny) / (.18 + .045 * Math.sin(nx * 9)));
      data[(y * w + x) * 4 + 3] = Math.round(255 * left * right * top * bottom);
    }
  } else {
    const exterior = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let protectedPixels: Uint8ClampedArray | undefined;
    if (kind === "light") {
      // The black trousers meet the original image edge. Protect their interior
      // explicitly so an exterior matte cannot turn the clothing translucent.
      ctx.clearRect(0, 0, w, h); ctx.save(); ctx.scale(w / 940, h / 1672);
      ctx.fillStyle = "#fff"; ctx.beginPath();
      ctx.moveTo(0, 811); ctx.bezierCurveTo(95, 753, 222, 723, 351, 674);
      ctx.bezierCurveTo(465, 680, 605, 691, 680, 777);
      ctx.bezierCurveTo(602, 880, 438, 1000, 194, 1115);
      ctx.lineTo(0, 1170); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(455, 286, 89, 86, -.35, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); protectedPixels = ctx.getImageData(0, 0, w, h).data;
    }
    let head = 0, tail = 0;
    const add = (index: number) => {
      if (exterior[index]) return;
      const i = index * 4;
      if (protectedPixels?.[i + 3]) return;
      // Boundary-connected darkness only. Bright enclosing rims protect opaque interiors.
      if (Math.max(data[i], data[i + 1], data[i + 2]) > (kind === "devices" ? 20 : 9)) return;
      exterior[index] = 1; queue[tail++] = index;
    };
    for (let x = 0; x < w; x++) { add(x); add((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { add(y * w); add(y * w + w - 1); }
    while (head < tail) {
      const i = queue[head++], x = i % w;
      if (x > 0) add(i - 1); if (x < w - 1) add(i + 1);
      if (i >= w) add(i - w); if (i < w * (h - 1)) add(i + w);
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (exterior[i]) data[i * 4 + 3] = 0;
      else if (kind === "light") {
        // The selected photo ends at the bedding/stand: soften those cropped ends.
        const end = Math.min(smooth(x / 20), smooth((w - 1 - x) / 20), smooth((h - 1 - y) / 26));
        data[i * 4 + 3] = Math.round(255 * end);
      }
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

export const deviceOrigin = (mobile: boolean) => ({ x: mobile ? .50 : .61, y: mobile ? .23 : .27 });

const mobileDeviceOffsets = {
  tablet: { x: -.18, y: -.08 }, phone: { x: .18, y: -.08 },
  laptop: { x: -.08, y: .07 }, router: { x: .20, y: .12 },
};

export function devicePose(d: typeof devices[number], q: number, w: number, h: number, mobile = w < 768) {
  const unit = Math.min(h, w * 1.15), t = clamp(q);
  const finalHeight = d.size * unit;
  const travel = Math.pow(clamp((t - .48) / .52), 1.8) * d.distance;
  const height = mix(.065 * unit, finalHeight, Math.pow(t, d.growth));
  const { x: originX, y: originY } = deviceOrigin(mobile);
  // Every device follows the same unchanging down-right vector. Different
  // distances separate the group without bending or changing lanes on exit.
  // Phones need separated silhouettes; fan out during the entrance, then keep
  // the established parallel down-right exit once the group has opened.
  const fan = mobile ? smooth((t - .06) / .32) : 0;
  const offset = mobileDeviceOffsets[d.name as keyof typeof mobileDeviceOffsets];
  const x = (originX + (mobile ? mix(d.x, offset.x, fan) : d.x) + travel) * w;
  const y = mobile ? originY * h + mix(d.y * h, offset.y * unit, fan) + travel * .34 * h : (originY + d.y + travel * .55) * h;
  return { x, y, height, width: height * d.crop[2] / d.crop[3], alpha: smooth(t / .28) };
}

export function servicePose(key: "studio" | "light", q: number, w: number, h: number, ratio: number, mobile: boolean, healingCenterX = w * .71) {
  const left = key === "studio", unit = Math.min(h, w * 1.15), t = clamp(q);
  if (!left) {
    const height = mix(.18 * unit, (mobile ? .86 : .78) * unit, smooth(t / .64));
    // This is the final scene: settle beside the footer instead of leaving it.
    return { x: mobile ? mix(.50, .67, smooth(t)) * w : healingCenterX,
      y: mix(mobile ? .30 : .48, mobile ? .50 : .49, smooth(t)) * h,
      height, width: height * ratio, alpha: smooth(t / .17) };
  }
  const finalHeight = .84 * unit, height = mix(.17 * unit, finalHeight, Math.pow(t, 1.12));
  const travel = smooth((t - .60) / .40), outside = finalHeight * ratio / w / 2 + .08;
  return { x: mix(mobile ? .5 : .28, -outside, travel) * w,
    y: mix(mobile ? .32 : .43, 1.5, travel) * h, height, width: height * ratio, alpha: smooth(t / .15) };
}

/** One continuous ribbon field, addressed by the same section progress as its subjects. */
export function drawFlow(ctx: CanvasRenderingContext2D, w: number, h: number, p: JourneyProgress, mobile: boolean) {
  let ax = .79, ay = mobile ? .32 : .48, direction = -1, spread = .10;
  for (const [q, x, y, dir] of [[p.tech, deviceOrigin(mobile).x, deviceOrigin(mobile).y, 1], [p.sound, mobile ? .5 : .28, mobile ? .32 : .43, -1], [p.healing, mobile ? .50 : (p.healingCenterX ?? w * .71) / w, mobile ? .30 : .48, 1]]) {
    const blend = smooth((q + .12) / .30);
    ax = mix(ax, x, blend); ay = mix(ay, y, blend); direction = mix(direction, dir, blend);
    spread = mix(spread, .03 + .20 * smooth((q - .12) / .5), blend);
  }
  const phase = clamp(p.whole) * Math.PI * 3, count = mobile ? 12 : 18;
  for (let i = 0; i < count; i++) {
    const f = i / (count - 1) - .5, shift = f * spread, dx = direction * .74;
    ctx.beginPath();
    ctx.moveTo((ax - dx) * w, (ay - .65 + shift) * h);
    ctx.bezierCurveTo((ax - dx * .68) * w, (ay + .03 * Math.sin(phase) + shift * .25) * h,
      (ax - dx * .12) * w, (ay + shift * .15) * h, ax * w, (ay + shift * .18) * h);
    ctx.bezierCurveTo((ax + dx * .22) * w, (ay + .02 + shift) * h,
      (ax + dx * .6) * w, (ay + .26 + shift * 1.8) * h, (ax + dx) * w, (ay + .75 + shift * 2) * h);
    ctx.strokeStyle = i % 3 ? `rgba(194,176,137,${.06 + .06 * (1 - Math.abs(f) * 2)})` : "rgba(100,151,149,.12)";
    ctx.lineWidth = i % 6 === 0 ? 1.4 : .7; ctx.stroke();
  }
}

const serviceVideoFrames = new WeakMap<HTMLVideoElement, { canvas: HTMLCanvasElement; time: number }>();
function videoArt(video: HTMLVideoElement | undefined, mask: Art | undefined) {
  if (!video || !mask) return mask;
  let cached = serviceVideoFrames.get(video);
  if (!video.seeking && video.readyState >= 2 && video.videoWidth > 0 && (!cached || cached.time !== video.currentTime)) {
    if (!cached) {
      const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      cached = { canvas, time: -1 }; serviceVideoFrames.set(video, cached);
    }
    const ctx = cached.canvas.getContext("2d");
    if (ctx) {
      const { width, height } = cached.canvas;
      ctx.clearRect(0, 0, width, height); ctx.save(); ctx.filter = "saturate(.72)";
      ctx.drawImage(video, 0, 0, width, height); ctx.filter = "none";
      ctx.globalCompositeOperation = "destination-in"; ctx.filter = "blur(2px)";
      ctx.drawImage(mask, 0, 0, width, height); ctx.restore();
      cached.time = video.currentTime;
    }
  }
  return cached?.canvas ?? mask;
}

const studioFrameMasks = new WeakMap<HTMLCanvasElement, { canvas: HTMLCanvasElement; key: string; mask: Art }>();
function studioFrameArt(frame: HTMLCanvasElement, mask?: Art) {
  if (!mask) return undefined;
  const key = `${frame.dataset.frameFrom}:${frame.dataset.frameTo}:${frame.dataset.frameFraction}`;
  let cached = studioFrameMasks.get(frame);
  if (!cached) {
    const canvas = document.createElement("canvas"); canvas.width = frame.width; canvas.height = frame.height;
    cached = { canvas, key: "", mask }; studioFrameMasks.set(frame, cached);
  }
  if (cached.key !== key || cached.mask !== mask) {
    const ctx = cached.canvas.getContext("2d");
    if (ctx) {
      const { width, height } = cached.canvas;
      ctx.clearRect(0, 0, width, height); ctx.save(); ctx.filter = "saturate(.72)";
      ctx.drawImage(frame, 0, 0, width, height); ctx.filter = "none";
      ctx.globalCompositeOperation = "destination-in"; ctx.filter = "blur(2px)";
      ctx.drawImage(mask, 0, 0, width, height); ctx.restore();
      cached.key = key; cached.mask = mask;
    }
  }
  return cached.canvas;
}

/** Copy a completed decode synchronously before the controller drains its next
 * seek. Waiting for the next paint can otherwise starve video during scrolling. */
export function captureJourneyFilms(images: JourneyImages) {
  const film = images.film;
  if (film && !film.seeking && film.readyState >= 2 && film.videoWidth > 0) {
    let frame = decodedFilmFrames.get(film);
    if (!frame) {
      frame = document.createElement("canvas"); frame.width = film.videoWidth; frame.height = film.videoHeight;
      decodedFilmFrames.set(film, frame);
    }
    frame.getContext("2d")?.drawImage(film, 0, 0);
  }
  videoArt(images.studioFilm, images.studio);
}

export function drawJourney(ctx: CanvasRenderingContext2D, w: number, h: number, p: JourneyProgress, images: JourneyImages, rider?: { image: Art; frame: number; visibleHeight?: number }, mobile = false) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#080b0d"; ctx.fillRect(0, 0, w, h);
  const field = images.field;
  if (!field?.naturalWidth) return;
  captureJourneyFilms(images);
  const filmFrame = images.film && decodedFilmFrames.get(images.film);
  // Seeking can temporarily remove HAVE_CURRENT_DATA. Keep the last actual
  // decoded frame rather than flashing a different background during the seek.
  const fw = filmFrame ? filmFrame.width : field.width, fh = filmFrame ? filmFrame.height : field.height;
  const s = Math.max(w / fw, h / fh) * 1.14;
  const fieldX = Math.sin(p.whole * Math.PI * 2) * w * .045, fieldY = mix(.045, -.045, clamp(p.whole)) * h;
  ctx.save(); ctx.globalAlpha = .42;
  ctx.drawImage(filmFrame ?? field, (w - fw * s) / 2 + fieldX, (h - fh * s) / 2 + fieldY, fw * s, fh * s);
  ctx.restore();
  drawFlow(ctx, w, h, p, mobile);
  for (const [key, q] of [["light", p.healing], ["studio", p.sound]] as const) {
    const im = key === "studio" ? (images.studioFrames ? studioFrameArt(images.studioFrames, images.studio) : videoArt(images.studioFilm, images.studio)) : images.lightFrames ?? images.light;
    if (!im || q < 0 || (key === "studio" && q > 1)) continue;
    const pose = servicePose(key, q, w, h, im.width / im.height, mobile, p.healingCenterX);
    ctx.save(); ctx.globalAlpha = pose.alpha;
    ctx.drawImage(im, pose.x - pose.width / 2, pose.y - pose.height / 2, pose.width, pose.height); ctx.restore();
  }
  const atlas = images.devices;
  if (atlas) for (const d of devices) {
    const q = (p.tech - d.delay) / d.duration;
    if (q < 0 || q > 1) continue;
    const { x, y, height, width, alpha } = devicePose(d, q, w, h, mobile);
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.drawImage(atlas, ...d.crop as [number, number, number, number], x - width / 2, y - height / 2, width, height); ctx.restore();
  }
  if (rider && p.rider >= 0 && p.rider <= 1) {
    // A fixed sampling window preserves the real filmed approach and avoids
    // magnifying the small early frames to the size of the final rider.
    const crop = frameAt();
    const [sx, sy, sw, sh] = crop.crop.map(n => n * rider.image.width / 384);
    const q = clamp(p.rider), travel = smooth((q - .08) / .92);
    const unit = mobile ? Math.min(h * .62, w * 1.3) : h;
    const finalSize = 1.25 * unit, size = mix(.62 * unit, finalSize, Math.pow(q, 1.1));
    const x = mix(.79 * w, -finalSize * sw / sh / 2 - w * .08, travel);
    // Position the visible subject, independent of the empty source canvas.
    // His opening tire sits above the paragraph midpoint on desktop and above
    // the paragraph on phones; his visible center follows one continuous line.
    const initialHeight = .62 * unit * 198 / 618;
    const initialCenter = (p.riderStartBottom ?? h * .35) - initialHeight / 2;
    const subjectCenterY = mix(initialCenter, h * .95, travel);
    const sourceCenter = 800 - (rider.visibleHeight ?? 614) / 2;
    const centerY = subjectCenterY - (sourceCenter - (184 + 618 / 2)) * size / 618;
    ctx.drawImage(rider.image, sx, sy, sw, sh, x - size * sw / sh / 2, centerY - size / 2, size * sw / sh, size);
  }
  const readingRight = p.readingRight ?? (p.sound > .3 && p.sound < .8);
  const shade = ctx.createLinearGradient(readingRight ? w : 0, 0, readingRight ? 0 : w, 0);
  shade.addColorStop(0, mobile ? "rgba(8,11,13,.05)" : "rgba(8,11,13,.45)");
  shade.addColorStop(.46, "rgba(8,11,13,.08)"); shade.addColorStop(.8, "rgba(8,11,13,0)");
  ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
}
