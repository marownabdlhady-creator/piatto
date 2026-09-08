"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { spaces } from "@/lib/spaces";
import { useRevealOnScroll } from "@/lib/use-reveal-on-scroll";

/**
 * Three full-bleed panels, edge to edge and touching, each a room of the
 * restaurant under a restrained scrim. Static by design - no hover state. The
 * grid mirrors on /ar, so the first panel reads first in both directions.
 */
export function Spaces() {
  const t = useTranslations("spaces");
  const rootRef = useRef<HTMLElement>(null);

  useRevealOnScroll(rootRef, "[data-reveal='space']");

  return (
    <section
      id="spaces"
      ref={rootRef}
      className="grid grid-cols-1 md:grid-cols-3"
    >
      {spaces.map((space) => (
        <Link
          key={space.key}
          href={space.href}
          data-reveal="space"
          className="reveal relative block aspect-[4/3] overflow-hidden bg-foreground md:aspect-auto md:h-[78svh]"
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
        </Link>
      ))}
    </section>
  );
}
