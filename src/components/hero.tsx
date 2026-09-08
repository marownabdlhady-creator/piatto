"use client";

import { useEffect, useState } from "react";

/**
 * Framed hero panel: the video sits inset from the page edges so the warm
 * off-white background reads as a margin around it. The poster is always
 * rendered as the base layer so it paints immediately (and stands in when
 * JavaScript is unavailable); the video mounts on top only when the visitor
 * has not asked for reduced motion, which also keeps the download off those
 * connections entirely.
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
    <section className="px-4 pb-4 md:px-8 md:pb-8 lg:px-12 lg:pb-10">
      <div className="relative mx-auto h-[72svh] w-full max-w-[1600px] overflow-hidden bg-foreground/5 md:h-[82svh] lg:h-[88svh]">
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
      </div>
    </section>
  );
}
