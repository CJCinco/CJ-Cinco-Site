"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { mountJourney } from "./journey-player";
import manifest from "../../public/visuals/rider-v2/manifest.json";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
type Playback = "static" | "desktop" | "mobile";
const queries = ["(prefers-reduced-motion: reduce)", "(max-width: 767px)"];
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;
function mode(): Playback {
  const network = connection();
  if (matchMedia(queries[0]).matches || network?.saveData || ["slow-2g", "2g"].includes(network?.effectiveType ?? "")) return "static";
  return matchMedia(queries[1]).matches ? "mobile" : "desktop";
}
function subscribe(notify: () => void) {
  const media = queries.map((query) => matchMedia(query));
  const network = connection();
  media.forEach((query) => query.addEventListener("change", notify));
  network?.addEventListener("change", notify);
  return () => {
    media.forEach((query) => query.removeEventListener("change", notify));
    network?.removeEventListener("change", notify);
  };
}

export default function HeroRider() {
  const playback = useSyncExternalStore<Playback>(subscribe, mode, () => "static");
  const [paused, setPaused] = useState(false);
  return <>
    <div className="cinematic-backdrop resonance-backdrop" aria-hidden="true"><Rider key={playback} playback={playback} paused={paused} /></div>
    {playback !== "static" && <button type="button" className="motion-toggle" data-motion-toggle aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume motion" : "Pause motion"}</button>}
  </>;
}

function Rider({ playback, paused }: { playback: Playback; paused: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const active = useRef<ReturnType<typeof mountJourney> | null>(null);
  useEffect(() => {
    if (playback === "static") {
      document.documentElement.dataset.resonanceMotion = "off";
      return () => { delete document.documentElement.dataset.resonanceMotion; };
    }
    if (!canvas.current) return;
    document.documentElement.dataset.resonanceMotion = "on";
    const player = mountJourney(canvas.current, playback, () => layer.current?.classList.add("journey-loaded"));
    active.current = player;
    return () => { player.dispose(); active.current = null; delete document.documentElement.dataset.resonanceMotion; };
  }, [playback]);
  useEffect(() => { active.current?.setPaused(paused); }, [paused, playback]);
  return (
    <div className="journey-layer" ref={layer}>
      <Image src="/visuals/resonance/flow-field-v3.webp" alt="" fill priority unoptimized className="journey-field" />
      <div className="rider-layer journey-poster"><Image src="/visuals/rider-v2/desktop/000.webp" width={manifest.desktop.width} height={manifest.desktop.height} alt="" priority unoptimized className="rider-still" /></div>
      <div className="journey-static-shade" />
      {playback !== "static" && <canvas ref={canvas} className="journey-canvas" />}
    </div>
  );
}
