"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
const reducedQuery = "(prefers-reduced-motion: reduce)";
const mobileQuery = "(max-width: 767px)";

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
  return window.matchMedia(mobileQuery).matches ? "mobile" : "desktop";
}

function subscribe(onChange: () => void) {
  const queries = [reducedQuery, mobileQuery].map((query) => window.matchMedia(query));
  queries.forEach((query) => query.addEventListener("change", onChange));
  const network = connection();
  network?.addEventListener("change", onChange);
  return () => {
    queries.forEach((query) => query.removeEventListener("change", onChange));
    network?.removeEventListener("change", onChange);
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

  useEffect(() => {
    const video = videoRef.current;
    const page = video?.closest<HTMLElement>(".site-shell");
    if (!video || !page || mode === "static" || failed) return;
    let frame = 0;
    let disposed = false;

    function seekToScroll() {
      frame = 0;
      if (!video || !Number.isFinite(video.duration)) return;
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

    const observer = new ResizeObserver(scheduleSeek);
    observer.observe(page);
    window.addEventListener("scroll", scheduleSeek, { passive: true });
    window.addEventListener("resize", scheduleSeek);
    video.addEventListener("loadeddata", scheduleSeek);
    video.addEventListener("seeked", scheduleSeek);
    scheduleSeek();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleSeek);
      window.removeEventListener("resize", scheduleSeek);
      video.removeEventListener("loadeddata", scheduleSeek);
      video.removeEventListener("seeked", scheduleSeek);
    };
  }, [mode, failed]);

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
