import sequence from "../../public/visuals/rider-v2/manifest.json";

const last = sequence.frameCount - 1;
const heights = sequence.frames.map(frame => frame.visibleHeight);
const slope = (i: number) => {
  if (i === 0) return heights[1] - heights[0];
  if (i === last) return heights[last] - heights[last - 1];
  const a = heights[i] - heights[i - 1], b = heights[i + 1] - heights[i];
  return a * b > 0 ? 2 * a * b / (a + b) : 0;
};

export function riderSampleAt(progress: number) {
  const t = Math.max(0, Math.min(1, progress / .82));
  // Ease into the final source pose without an abrupt stop in approach speed.
  const frame = t * t * (3 - 2 * t) * last;
  const from = Math.floor(frame), to = Math.min(last, from + 1), fraction = frame - from;
  const f = fraction, f2 = f * f, f3 = f2 * f;
  const height = from === to ? heights[from] :
    (2 * f3 - 3 * f2 + 1) * heights[from] + (f3 - 2 * f2 + f) * slope(from) +
    (-2 * f3 + 3 * f2) * heights[to] + (f3 - f2) * slope(to);
  return { frame, from, to, fraction, height };
}

export function createRiderFrames(variant: "desktop" | "mobile") {
  const canvas = document.createElement("canvas");
  const { width, height } = sequence[variant];
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  let previous = "";
  return {
    sample(progress: number, frames: Map<number, HTMLImageElement>) {
      if (!ctx || !frames.size) return;
      const target = riderSampleAt(progress);
      const nearest = (requested: number) => frames.has(requested) ? requested :
        [...frames.keys()].sort((a, b) => Math.abs(a - requested) - Math.abs(b - requested) || a - b)[0];
      const from = nearest(target.from), to = nearest(target.to);
      const fraction = from === to ? 0 : target.fraction;
      const key = `${from}:${to}:${fraction}:${target.height}`;
      if (key !== previous) {
        ctx.clearRect(0, 0, width, height);
        const draw = (index: number, alpha: number, composite: GlobalCompositeOperation) => {
          const image = frames.get(index)!;
          const scale = target.height / heights[index];
          const baseline = sequence.frames[index].tireBaseline * width / sequence.desktop.width;
          // Align both source silhouettes to the same head/tire interval before
          // premultiplied blending, avoiding double helmet and wheel outlines.
          ctx.globalCompositeOperation = composite; ctx.globalAlpha = alpha;
          ctx.drawImage(image, width / 2 * (1 - scale), baseline * (1 - scale), width * scale, height * scale);
        };
        draw(from, 1 - fraction, "source-over");
        if (fraction) draw(to, fraction, "lighter");
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
        previous = key;
      }
      canvas.dataset.frameFrom = String(from); canvas.dataset.frameTo = String(to);
      canvas.dataset.frameFraction = String(fraction);
      canvas.dataset.visibleHeight = String(target.height);
      return { image: canvas, frame: target.frame, visibleHeight: target.height };
    },
    dispose() { canvas.width = 1; canvas.height = 1; },
  };
}
