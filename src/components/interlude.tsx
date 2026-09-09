"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

import { useRevealOnScroll } from "@/lib/use-reveal-on-scroll";

const LINES = ["line1", "line2", "line3"] as const;

/**
 * The pause between the rooms and the panels: three short lines, one under
 * another, over a wide run of off-white. It exists to give the eye somewhere
 * to rest between two runs of pictures, so the space around it is the point.
 * Centred and logically spaced, so it reads the same in both directions.
 */
export function Interlude() {
  const t = useTranslations("interlude");
  const rootRef = useRef<HTMLElement>(null);

  useRevealOnScroll(rootRef, "[data-reveal='interlude']");

  return (
    <section
      ref={rootRef}
      className="bg-background px-4 py-28 text-foreground sm:px-6 md:px-8 md:py-40 lg:px-12 lg:py-48"
    >
      <div className="mx-auto flex max-w-[40rem] flex-col items-center gap-4 text-center md:gap-6">
        {LINES.map((key) => (
          <p
            key={key}
            data-reveal="interlude"
            className="reveal text-[1.15rem] leading-[1.6] text-balance md:text-[1.6rem] md:leading-[1.5]"
          >
            {t(key)}
          </p>
        ))}
      </div>
    </section>
  );
}
