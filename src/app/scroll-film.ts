/** Paused media addressed by absolute progress. No clock, loop or scroll history. */
export function mountScrollFilm(video: HTMLVideoElement, source: string, onFrame: () => void = () => {}, framesPerSecond = 24) {
  let alive = true, enabled = true, progress = 0;
  const end = () => Number.isFinite(video.duration) ? Math.max(0, video.duration - 1 / framesPerSecond) : 0;
  video.muted = true; video.playsInline = true; video.loop = false; video.preload = "auto";
  video.setAttribute("aria-hidden", "true");
  video.pause();
  function seek() {
    if (!alive || !enabled || document.hidden || video.seeking || !end()) return;
    // Do not decode the same source frame again for every fractional scroll pixel.
    const target = Math.round(progress * Math.round(end() * framesPerSecond)) / framesPerSecond;
    // A source without usable byte ranges must not spin on repeated failed seeks.
    if (target > 0 && (!video.seekable.length || video.seekable.end(video.seekable.length - 1) + .001 < target)) return;
    if (Math.abs(video.currentTime - target) > 1 / 1000) video.currentTime = target;
  }
  // The consumer captures these decoded pixels synchronously. Do not defer
  // their capture until after seek() marks the element as seeking again.
  function onSeeked() { onFrame(); seek(); }
  function onReady() { onFrame(); seek(); }
  function onVisibility() { if (!document.hidden) seek(); }
  video.addEventListener("loadedmetadata", onReady); video.addEventListener("loadeddata", onReady);
  video.addEventListener("progress", onReady); video.addEventListener("canplay", onReady);
  video.addEventListener("seeked", onSeeked); video.addEventListener("error", onFrame);
  document.addEventListener("visibilitychange", onVisibility);
  video.src = source;
  return {
    setProgress(value: number) {
      const next = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
      if (next !== progress) { progress = next; seek(); }
    },
    setPaused(paused: boolean) { enabled = !paused; if (enabled) seek(); },
    dispose() {
      alive = false; video.pause();
      video.removeEventListener("loadedmetadata", onReady); video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("progress", onReady); video.removeEventListener("canplay", onReady);
      video.removeEventListener("seeked", onSeeked); video.removeEventListener("error", onFrame);
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeAttribute("src"); video.load(); video.remove();
    },
  };
}
