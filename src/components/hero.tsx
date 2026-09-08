"use client";

import { useEffect, useState } from "react";

/**
 * Full-viewport video hero. The poster is always rendered as the base layer so
 * it paints immediately (and stands in when JavaScript is unavailable); the
 * video mounts on top only when the visitor has not asked for reduced motion,
 * which also keeps the download off those connections entirely.
 */
export function Hero() {
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPlayVideo(!query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <section id="top" className="relative h-svh w-full overflow-hidden bg-foreground">
      {/* Shares its URL with the video's poster attribute, so it is fetched once. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-poster.jpg"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {playVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero.webm" type="video/webm" />
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/40"
      />
    </section>
  );
}
