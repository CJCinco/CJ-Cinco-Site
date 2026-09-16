import { clamp, deviceOrigin, captureJourneyFilms, drawJourney, frameAt, prepareArt, type JourneyImages, type JourneyProgress } from "./journey-scene";
import { mountScrollFilm } from "./scroll-film";
import { createImageLoader } from "./image-loader";
import { mountScrollFrames } from "./scroll-frames";
import { createRiderFrames } from "./rider-frames";
import studioSequence from "../../public/visuals/resonance/studio-frames-v1/index.json";
import lightSequence from "../../public/visuals/resonance/light-frames-v6/index.json";

export function mountJourney(canvas: HTMLCanvasElement, variant: "desktop" | "mobile", onReady: () => void) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { dispose() {}, setPaused(_paused: boolean) { void _paused; } };
  const images: JourneyImages = {}, loader = createImageLoader(2);
  const lastFrame = frameAt().frame, riderFrames = new Map<number, HTMLImageElement>();
  const riderSequence = createRiderFrames(variant);
  let alive = true, raf = 0, ready = false, paused = false;
  let ranges: Record<string, { top: number; height: number }> = {};
  let viewport = innerHeight, pageHeight = 1, width = 1, height = 1, dpr = 1;
  let frozen: JourneyProgress | undefined;
  let riderStartBottom: number | undefined, aboutCopyTop: number | undefined, healingCenterX: number | undefined;
  const queue = [
    { key: "field", url: "/visuals/resonance/flow-field-v3.webp" },
    { key: "rider-0", url: `/visuals/rider-v2/${variant}/000.webp` },
    ...["devices", "studio"].map(key => ({ key, url: `/visuals/resonance/${key}.webp` })),
    { key: "light", url: `/visuals/resonance/light-frames-v6/${variant}/${String(lightSequence.frameCount - 1).padStart(3, "0")}.webp` },
    ...Array.from({ length: lastFrame }, (_, i) => ({ key: `rider-${i + 1}`, url: `/visuals/rider-v2/${variant}/${String(i + 1).padStart(3, "0")}.webp` })),
  ];
  function schedule() { if (alive && !document.hidden && !raf) raf = requestAnimationFrame(render); }
  const lightFrames = mountScrollFrames({ source: `/visuals/resonance/light-frames-v6/${variant}`, frameCount: lightSequence.frameCount, ...lightSequence[variant] }, loader.load, frame => {
    images.lightFrames = frame;
    // Once the sequence has painted, its canvas is also the loading fallback.
    // Release the separate endpoint so it cannot become a fifteenth sample.
    delete images.light; schedule();
  });
  function decoded() { captureJourneyFilms(images); schedule(); }
  function film(key: "film" | "studioFilm", name: string, fps: number) {
    const video = document.createElement("video"); video.className = "journey-source-video";
    canvas.parentElement?.appendChild(video); images[key] = video;
    return mountScrollFilm(video, `/visuals/resonance/${name}`, decoded, fps);
  }
  const backgroundFilm = film("film", `flow-field-motion-${variant}-v3.mp4`, 24);
  // Phone browsers can indefinitely withhold seekable data for a paused video.
  // Original frames keep Sound scroll-addressed without playback permission.
  const studioFilm = variant === "desktop" ? film("studioFilm", "studio-motion-desktop-v5.mp4", 30) : undefined;
  const studioFrames = variant === "mobile" ? mountScrollFrames({ source: "/visuals/resonance/studio-frames-v1/mobile", frameCount: studioSequence.frameCount, ...studioSequence.mobile }, loader.load, frame => {
    images.studioFrames = frame; schedule();
  }) : undefined;
  const films = [backgroundFilm, ...(studioFilm ? [studioFilm] : [])];
  const sections = ["tech-help", "sound", "healing"].map(id => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
  function measure() {
    viewport = innerHeight; pageHeight = Math.max(1, document.documentElement.scrollHeight - viewport);
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 1.5);
    const pixelsWide = Math.round(width * dpr), pixelsHigh = Math.round(height * dpr);
    if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) { canvas.width = pixelsWide; canvas.height = pixelsHigh; }
    ranges = Object.fromEntries(sections.map(el => [el.id, { top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight }]));
    const aboutCopy = document.querySelector("#about .section-copy")?.getBoundingClientRect();
    aboutCopyTop = aboutCopy ? aboutCopy.top + scrollY : undefined;
    const healingSection = document.getElementById("healing")?.getBoundingClientRect();
    const healingCopy = document.querySelector("#healing .journey-content")?.getBoundingClientRect();
    healingCenterX = healingSection && healingCopy ? (healingCopy.right + healingSection.right) / 2 - rect.left : undefined;
    const paragraph = document.querySelector(".hero-description")?.getBoundingClientRect();
    riderStartBottom = paragraph ? paragraph.top + scrollY + (variant === "mobile" ? -24 : paragraph.height * .30) : undefined;
    schedule();
  }
  function progress(): JourneyProgress {
    const mobile = variant === "mobile";
    const section = (id: string) => {
      const r = ranges[id];
      const entry = id === "tech-help" ? .80 : .64;
      // Measure the content span so compact sections still have a full entrance,
      // reading hold and departure as the following section arrives.
      if (!r) return -1;
      const originalStart = r.top - viewport * entry;
      // Keep devices hidden until the About body reaches their emergence point.
      // Preserve the existing end of the sequence and its down-right departure.
      const start = id === "tech-help" && aboutCopyTop !== undefined
        ? Math.max(originalStart, aboutCopyTop - height * deviceOrigin(mobile).y)
        : originalStart;
      const end = r.top + r.height - viewport * (mobile ? .28 : .20);
      return (scrollY - start) / Math.max(1, end - start);
    };
    const sound = ranges.sound, healing = ranges.healing;
    return {
      rider: scrollY / Math.max(1, document.getElementById("about")?.offsetTop ?? viewport),
      riderStartBottom, healingCenterX,
      tech: section("tech-help"), sound: section("sound"),
      healing: healing ? (scrollY - (healing.top - viewport * .64)) / Math.max(1, pageHeight - (healing.top - viewport * .64)) : -1,
      whole: clamp(scrollY / pageHeight),
      readingRight: !!sound && scrollY + viewport * .48 >= sound.top && scrollY + viewport * .48 < sound.top + sound.height,
    };
  }
  function loadArtwork() {
    for (const item of queue) loader.load(item.url, im => {
      if (!alive || !im) return;
      if (item.key.startsWith("rider-")) riderFrames.set(Number(item.key.slice(6)), im);
      else if (item.key === "field") images.field = im;
      else if (item.key === "light") { if (!images.lightFrames) images.light = im; }
      else { const key = item.key as "devices" | "studio"; images[key] = prepareArt(im, key); }
      schedule();
    });
  }
  function render() {
    raf = 0;
    if (!alive || document.hidden || !width || !height) return;
    const p = paused && frozen ? frozen : progress();
    // Every output is a function of this same absolute scroll snapshot.
    const rider = riderSequence.sample(p.rider, riderFrames);
    backgroundFilm.setProgress(p.whole); studioFilm?.setProgress(clamp(p.sound));
    const studioActive = p.sound >= -.15 && p.sound <= 1.05;
    studioFrames?.setProgress(p.sound, studioActive);
    canvas.dataset.studioFrame = !studioFrames ? "video" : !studioActive ? "inactive" : images.studioFrames ? `${images.studioFrames.dataset.frameFrom}:${images.studioFrames.dataset.frameTo}:${images.studioFrames.dataset.frameFraction}` : "loading";
    lightFrames.setProgress(p.healing, p.healing >= -.28);
    canvas.dataset.lightFrame = images.lightFrames ? `${images.lightFrames.dataset.frameFrom}:${images.lightFrames.dataset.frameTo}:${images.lightFrames.dataset.frameFraction}` : "loading";
    canvas.dataset.riderFrame = rider ? `${rider.image.dataset.frameFrom}:${rider.image.dataset.frameTo}:${rider.image.dataset.frameFraction}` : "loading";
    canvas.dataset.scrollProgress = String(p.whole);
    canvas.dataset.techProgress = String(p.tech);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawJourney(ctx!, width, height, p, images, rider, variant === "mobile");
    if (!ready && images.field && (p.rider > 1 || rider)) { ready = true; onReady(); }
  }
  function visibility() { cancelAnimationFrame(raf); raf = 0; if (!document.hidden) schedule(); }
  loadArtwork();
  const resize = new ResizeObserver(measure);
  sections.forEach(el => resize.observe(el)); resize.observe(document.body);
  addEventListener("scroll", schedule, { passive: true }); addEventListener("resize", measure);
  document.addEventListener("visibilitychange", visibility);
  document.fonts?.ready.then(() => { if (alive) measure(); }); measure();
  return {
    setPaused(value: boolean) { frozen = value ? progress() : undefined; paused = value; films.forEach(f => f.setPaused(value)); schedule(); },
    dispose() {
      alive = false; cancelAnimationFrame(raf); resize.disconnect();
      removeEventListener("scroll", schedule); removeEventListener("resize", measure); document.removeEventListener("visibilitychange", visibility);
      films.forEach(f => f.dispose()); studioFrames?.dispose(); lightFrames.dispose(); riderSequence.dispose(); loader.dispose(); riderFrames.clear();
    },
  };
}
