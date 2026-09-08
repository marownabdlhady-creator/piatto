"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { ENTRANCE, entranceScale } from "@/lib/entrance";

/**
 * Framed hero panel: the video sits inset from the page edges so the warm
 * off-white background reads as a margin around it. The poster is always
 * rendered as the base layer so it paints immediately (and stands in when
 * JavaScript is unavailable); the video mounts on top only when the visitor
 * has not asked for reduced motion, which also keeps the download off those
 * connections entirely.
 */
export function Hero() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPlayVideo(!query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Closes out the page entrance: the panel rises in just after the nav links.
  // Timings live in ENTRANCE so the two components stay in step.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const scale = entranceScale();

      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: ENTRANCE.panel.y },
        {
          opacity: 1,
          y: 0,
          ease: ENTRANCE.ease,
          duration: ENTRANCE.panel.duration * scale,
          delay: ENTRANCE.panel.at * scale,
        },
      );
    }, panelRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 lg:px-12 lg:pb-10">
      <div
        ref={panelRef}
        data-reveal="panel"
        className="reveal relative mx-auto aspect-[3/2] w-full max-w-[1600px] overflow-hidden bg-foreground/5 sm:aspect-auto sm:h-[58svh] md:h-[82svh] lg:h-[88svh]"
      >
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
