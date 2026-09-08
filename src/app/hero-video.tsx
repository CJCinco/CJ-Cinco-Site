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
    let timer = 0;
    let disposed = false;
    let kicking = false;
    let settled = false;

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

    // Safari on iOS and iPadOS will not buffer a preloaded film, and will not
    // paint a seeked frame, until the element has played once. Start it just
    // long enough to decode one frame, then hold it paused for good. Other
    // engines seek a paused film correctly and are left alone.
    const needsKick = /apple/i.test(navigator.vendor || "");

    function settle() {
      if (!video || settled) return;
      settled = true;
      kicking = false;
      window.clearTimeout(timer);
      video.pause();
      reveal();
      scheduleSeek();
    }

    // "playing" is the browser saying a frame is on screen, which is exactly
    // what the kick is for. Stop there rather than guessing at a delay.
    function onPlaying() {
      settle();
    }

    function abandonKick() {
      if (!video || settled) return;
      video.pause();
      kicking = false; // playback never really started; a later gesture may retry
    }

    function kick() {
      if (!video || disposed || settled || kicking) return;
      kicking = true; // claim the kick now: a second play() would outlive the pause
      window.clearTimeout(timer);
      timer = window.setTimeout(abandonKick, 2000);
      let started: Promise<void> | undefined;
      try {
        started = video.play();
      } catch {
        abandonKick();
        return;
      }
      // Low Power Mode refuses programmatic playback; retry on a gesture.
      started?.catch?.(abandonKick);
    }

    // The film is scroll-driven, so it must never play on its own.
    function holdPaused() {
      if (video && settled && !video.paused) video.pause();
    }

    function onGesture() {
      if (needsKick) kick();
      scheduleSeek();
    }

    const gestures = ["touchstart", "pointerdown", "keydown"] as const;
    const observer = new ResizeObserver(scheduleSeek);
    observer.observe(page);
    window.addEventListener("scroll", onGesture, { passive: true });
    window.addEventListener("resize", scheduleSeek);
    window.addEventListener("pageshow", scheduleSeek);
    gestures.forEach((name) =>
      window.addEventListener(name, onGesture, { passive: true } as AddEventListenerOptions),
    );
    video.addEventListener("play", holdPaused);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("loadedmetadata", scheduleSeek);
    video.addEventListener("loadeddata", reveal);
    video.addEventListener("canplay", reveal);
    video.addEventListener("loadeddata", scheduleSeek);
    video.addEventListener("seeked", scheduleSeek);
    if (needsKick) video.addEventListener("loadedmetadata", kick);

    if (video.readyState === 0) video.load();
    if (needsKick && video.readyState >= 1) kick();
    scheduleSeek();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      video.pause(); // never hand back a film that is still running
      observer.disconnect();
      window.removeEventListener("scroll", onGesture);
      window.removeEventListener("resize", scheduleSeek);
      window.removeEventListener("pageshow", scheduleSeek);
      gestures.forEach((name) => window.removeEventListener(name, onGesture));
      video.removeEventListener("play", holdPaused);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("loadedmetadata", scheduleSeek);
      video.removeEventListener("loadeddata", reveal);
      video.removeEventListener("canplay", reveal);
      video.removeEventListener("loadeddata", scheduleSeek);
      video.removeEventListener("seeked", scheduleSeek);
      video.removeEventListener("loadedmetadata", kick);
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
