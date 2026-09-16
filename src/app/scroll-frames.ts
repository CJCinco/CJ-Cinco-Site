import type { ImageLoadHandle, LoadImage } from "./image-loader";

type Sequence = { source: string; frameCount: number; width: number; height: number };

/** Original transparent video frames, with an absolute, fractional scroll cursor.
 * Only a small neighborhood is decoded; adjacent frames blend on the same paint. */
export function mountScrollFrames(sequence: Sequence, load: LoadImage, onFrame: (canvas: HTMLCanvasElement) => void) {
  const canvas = document.createElement("canvas"); canvas.width = sequence.width; canvas.height = sequence.height;
  const ctx = canvas.getContext("2d");
  const frames = new Map<number, HTMLImageElement>(), pending = new Map<number, ImageLoadHandle>(), failed = new Set<number>();
  const radius = 6;
  let alive = true, cursor = 0, wanted = false, painted = "";
  function paint() {
    if (!alive || !ctx || document.hidden || !frames.size) return;
    const low = Math.floor(cursor), high = Math.ceil(cursor);
    const a = frames.get(low), b = frames.get(high);
    const nearest = [...frames.keys()].sort((x, y) => Math.abs(x - cursor) - Math.abs(y - cursor) || x - y)[0];
    const from = a && b ? low : nearest, to = a && b ? high : nearest, fraction = from === to ? 0 : cursor - low;
    const key = `${from}:${to}:${fraction}`;
    if (key === painted) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save();
    // Add premultiplied samples so transparent edges retain their coverage.
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1 - fraction;
    ctx.drawImage(frames.get(from)!, 0, 0, canvas.width, canvas.height);
    if (fraction > 0) { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = fraction; ctx.drawImage(frames.get(to)!, 0, 0, canvas.width, canvas.height); }
    ctx.restore(); painted = key;
    canvas.dataset.frameFrom = String(from); canvas.dataset.frameTo = String(to); canvas.dataset.frameFraction = String(fraction);
    onFrame(canvas);
  }
  function request() {
    if (!alive || !wanted || document.hidden) return;
    const low = Math.floor(cursor), high = Math.ceil(cursor), order = [low, high];
    for (let offset = 1; offset <= radius; offset++) order.push(low - offset, high + offset);
    const desired = [...new Set(order.filter(index => index >= 0 && index < sequence.frameCount))];
    for (const [index, cancel] of pending) if (!desired.includes(index)) { pending.delete(index); cancel(); }
    for (const index of frames.keys()) if (!desired.includes(index)) frames.delete(index);
    for (const index of desired) {
      const existing = pending.get(index);
      if (existing) {
        if (index === low || index === high) existing.promote();
        continue;
      }
      if (frames.has(index) || failed.has(index)) continue;
      const cancel = load(`${sequence.source}/${String(index).padStart(3, "0")}.webp`, image => {
        pending.delete(index);
        if (!alive) return;
        if (image) frames.set(index, image); else failed.add(index);
        paint();
      }, index === low || index === high);
      pending.set(index, cancel);
    }
    paint();
  }
  return {
    setProgress(value: number, nearViewport = true) {
      if (!alive) return;
      cursor = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * (sequence.frameCount - 1);
      wanted = nearViewport;
      if (wanted) request();
      else { for (const cancel of pending.values()) cancel(); pending.clear(); frames.clear(); }
    },
    dispose() {
      alive = false; for (const cancel of pending.values()) cancel(); pending.clear(); frames.clear(); failed.clear();
      canvas.width = canvas.height = 1;
    },
  };
}
