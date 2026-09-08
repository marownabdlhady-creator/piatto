"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { Link } from "@/i18n/navigation";
import { ENTRANCE, entranceScale } from "@/lib/entrance";
import { spaces } from "@/lib/spaces";

/**
 * Three full-bleed panels, edge to edge and touching, each a room of the
 * restaurant under a restrained scrim. Static by design - no hover state. The
 * grid mirrors on /ar, so the first panel reads first in both directions.
 */
export function Spaces() {
  const t = useTranslations("spaces");
  const rootRef = useRef<HTMLElement>(null);

  // Entrance, once, the first time the row scrolls into view: each panel fades
  // and rises while its contents resolve out of a soft blur. The blur sits on
  // an inner layer that the panel clips, so the panel's own edges stay razor
  // sharp and never bleed into their neighbours; the slight scale on that layer
  // keeps the blur's soft fringe outside the clip. Both are filter/transform
  // only, so nothing below the row moves.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const panels = root.querySelectorAll("[data-reveal='space']");
    const layers = root.querySelectorAll("[data-reveal='space-layer']");

    // The soft state is declared in CSS, so it cannot be dropped with
    // clearProps - the final values have to be written back over it.
    const settleLayers = () =>
      gsap.set(layers, { filter: "none", scale: 1, willChange: "auto" });

    if (entranceScale() === 0) {
      gsap.set(panels, { opacity: 1, y: 0 });
      settleLayers();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        // Promoted here rather than in the class, so three large panels are
        // not held on their own compositor layers from page load.
        gsap.set(layers, { willChange: "filter, transform" });

        gsap
          .timeline({ onComplete: settleLayers })
          .fromTo(
            panels,
            { opacity: 0, y: 38 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              stagger: 0.15,
              ease: ENTRANCE.ease,
            },
            0,
          )
          // Trails the rise on a gentler curve, so the image keeps resolving
          // after the panel has settled rather than snapping into focus.
          .fromTo(
            layers,
            { filter: "blur(10px)", scale: 1.06 },
            {
              filter: "blur(0px)",
              scale: 1,
              duration: 1.7,
              stagger: 0.15,
              ease: "power2.out",
            },
            0,
          );
      },
      { rootMargin: "0px 0px -15% 0px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="spaces"
      ref={rootRef}
      className="grid grid-cols-1 md:grid-cols-3"
    >
      <noscript>
        <style>{`[data-reveal='space']{opacity:1!important;transform:none!important}[data-reveal='space-layer']{filter:none!important;transform:none!important}`}</style>
      </noscript>

      {spaces.map((space) => (
        <Link
          key={space.key}
          href={space.href}
          data-reveal="space"
          className="reveal relative block aspect-[4/3] overflow-hidden bg-foreground md:aspect-auto md:h-[78svh]"
        >
          <span
            data-reveal="space-layer"
            className="reveal-soft absolute inset-0 block"
          >
            <Image
              src={space.image}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/25"
            />

            <span className="absolute inset-0 flex items-center justify-center px-6">
              <span className="tracked-label text-center text-[1.05rem] tracking-[0.26em] text-white uppercase md:text-[1.2rem]">
                {t(space.key)}
              </span>
            </span>
          </span>
        </Link>
      ))}
    </section>
  );
}
