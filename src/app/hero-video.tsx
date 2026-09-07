"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
const reducedQuery = "(prefers-reduced-motion: reduce)";
// The portrait-cropped film also suits tablets held upright; landscape tablets
// and laptops keep the wide asset.
const portraitQuery = "(max-width: 767px), (max-width: 1024px) and (orientation: portrait)";

function connection() {
  return (navigator as Navigator & { connection?: Connection }).connection;
}

function playbackMode() {
  const network = connection();
  if (
    window.matchMedia(reducedQuery).matches ||
    network?.saveData ||
    ["slow-2g", "2g"].includes(network?.effectiveType ?? "")
  ) return "static";
  return window.matchMedia(portraitQuery).matches ? "mobile" : "desktop";
}

function subscribe(onChange: () => void) {
  const queries = [reducedQuery, portraitQuery].map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  const network = connection();
  network?.addEventListener("change", onChange);
  window.addEventListener("orientationchange", onChange);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", onChange));
    network?.removeEventListener("change", onChange);
    window.removeEventListener("orientationchange", onChange);
  };
}

export default function HeroVideo() {
  const mode = useSyncExternalStore(subscribe, playbackMode, () => "static");
  return <div className="cinematic-backdrop" aria-hidden="true"><HeroFilm key={mode} mode={mode} /></div>;
}

function HeroFilm({ mode }: { mode: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reveal = useCallback(() => setReady(true), []);

  useEffect(() => {
    const video = videoRef.current;
    const page = video?.closest<HTMLElement>(".site-shell");
    if (!video || !page || mode === "static" || failed) return;
    let frame = 0;
    let disposed = false;
    let primed = false;

    function seekToScroll() {
      frame = 0;
      if (!video || disposed || !Number.isFinite(video.duration) || video.duration <= 0) return;
      // Use the page's real scroll range; never add height or pin its content.
      const distance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / distance));
      const target = progress * Math.max(0, video.duration - 1 / 24);
      const tolerance = progress === 0 || progress === 1 ? 0.001 : 1 / 48;
      if (!video.seeking && Math.abs(video.currentTime - target) > tolerance) {
        video.currentTime = target;
      }
    }

    function scheduleSeek() {
      if (!disposed && !frame) frame = requestAnimationFrame(seekToScroll);
    }

    // Safari on iOS and iPadOS will not buffer a preload="auto" film, and will
    // not paint a seeked frame, until the element has been played at least
    // once. Start it muted and inline, then pause immediately; the first frame
    // arrives and every later seek renders. If the browser refuses (Low Power
    // Mode blocks programmatic playback), retry on the first real gesture.
    function prime() {
      if (disposed || primed || !video) return;
      const started = video.play();
      if (!started) {
        primed = true;
        video.pause();
        scheduleSeek();
        return;
      }
      started
        .then(() => {
          if (disposed) return;
          primed = true;
          video.pause();
          reveal();
          scheduleSeek();
        })
        .catch(() => undefined);
    }

    const gestures = ["touchstart", "touchend", "pointerdown", "click", "keydown"] as const;
    function onGesture() {
      prime();
      scheduleSeek();
    }

    const observer = new ResizeObserver(scheduleSeek);
    observer.observe(page);
    window.addEventListener("scroll", onGesture, { passive: true });
    window.addEventListener("resize", scheduleSeek);
    window.addEventListener("pageshow", scheduleSeek);
    gestures.forEach((name) =>
      window.addEventListener(name, onGesture, { passive: true } as AddEventListenerOptions),
    );
    video.addEventListener("loadedmetadata", scheduleSeek);
    video.addEventListener("loadeddata", reveal);
    video.addEventListener("canplay", reveal);
    video.addEventListener("loadeddata", scheduleSeek);
    video.addEventListener("seeked", scheduleSeek);
    video.addEventListener("loadedmetadata", prime);

    // iOS ignores preload on a freshly inserted element often enough to be
    // worth an explicit nudge.
    if (video.readyState === 0) video.load();
    if (video.readyState >= 1) prime();
    scheduleSeek();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onGesture);
      window.removeEventListener("resize", scheduleSeek);
      window.removeEventListener("pageshow", scheduleSeek);
      gestures.forEach((name) => window.removeEventListener(name, onGesture));
      video.removeEventListener("loadedmetadata", scheduleSeek);
      video.removeEventListener("loadeddata", reveal);
      video.removeEventListener("canplay", reveal);
      video.removeEventListener("loadeddata", scheduleSeek);
      video.removeEventListener("seeked", scheduleSeek);
      video.removeEventListener("loadedmetadata", prime);
    };
  }, [mode, failed, reveal]);

  return (
    <>
      <Image src="/visuals/cj-cinco-music-poster.jpg" alt="" fill priority sizes="100vw" className="hero-poster" />
      {mode !== "static" && !failed && (
        <video
          ref={videoRef}
          id="hero-motion"
          src={`/visuals/cj-cinco-music-${mode}.mp4`}
          className={`hero-video${ready ? " is-ready" : ""}`}
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          tabIndex={-1}
          onLoadStart={() => setReady(false)}
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
      <div className="film-shade" />
    </>
  );
}
