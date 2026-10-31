"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroAnimation({ labels }: { labels: { pause: string; play: string } }) {
  const video = useRef<HTMLVideoElement>(null);
  const sync = useRef<() => void>(() => {});
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    let failed = false;
    let disposed = false;
    el.muted = true;

    const update = () => {
      if (disposed) return;
      if (motion.matches || connection?.saveData) {
        el.pause();
        if (el.hasAttribute("src")) {
          el.removeAttribute("src");
          el.load();
        }
        setReady(false);
        setAvailable(false);
        return;
      }
      if (!visible || document.hidden || userPaused.current || failed) {
        el.pause();
        return;
      }
      if (!el.hasAttribute("src")) el.src = "/landing/handshake-hero.mp4";
      void el.play().catch(() => {
        if (!disposed && !failed && !motion.matches) setAvailable(true);
      });
    };
    const reveal = () => {
      if (!disposed) { setReady(true); setAvailable(true); setPlaying(true); }
    };
    const pause = () => { if (!disposed) setPlaying(false); };
    const failure = () => { failed = true; setReady(false); setAvailable(false); };
    el.addEventListener("playing", reveal);
    el.addEventListener("pause", pause);
    el.addEventListener("error", failure);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: 0.05 });
    observer.observe(el);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    sync.current = update;
    return () => {
      disposed = true;
      observer.disconnect();
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      el.removeEventListener("playing", reveal);
      el.removeEventListener("pause", pause);
      el.removeEventListener("error", failure);
      el.pause();
      el.removeAttribute("src");
      el.load();
      sync.current = () => {};
    };
  }, []);

  return (
    <div className="hero__artifact hero__animation" data-ready={ready || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero__animation-poster" data-visual="proof" src="/landing/handshake-hero.webp" width={960} height={960} alt="" fetchPriority="high" />
      <video ref={video} className="hero__animation-video" width={960} height={960} muted loop playsInline preload="none" aria-hidden="true" />
      {available && (
        <button
          type="button"
          className="hero__motion"
          aria-pressed={!playing}
          onClick={() => {
            userPaused.current = playing;
            sync.current();
          }}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
          {playing ? labels.pause : labels.play}
        </button>
      )}
    </div>
  );
}
