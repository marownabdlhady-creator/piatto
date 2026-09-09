"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

import { useRevealOnScroll } from "@/lib/use-reveal-on-scroll";

const PARAGRAPHS = ["p1", "p2", "p3", "p4", "p5"] as const;
const LOGO_SLOTS = [0, 1];

/**
 * The story of the restaurant: a heading, a centred column of copy held to a
 * comfortable measure, and a closing signature line set apart beneath it, over
 * an off-white ground with a row of empty logo plates below. Centred text and
 * logical spacing keep it correct in both directions; the Latin "Piatto" in
 * the Arabic copy is left to the bidi algorithm, which places it correctly
 * inside the right-to-left run.
 */
export function About() {
  const t = useTranslations("about");
  const rootRef = useRef<HTMLElement>(null);

  useRevealOnScroll(rootRef, "[data-reveal='about']");

  return (
    <section
      id="about"
      ref={rootRef}
      className="bg-background px-4 py-24 text-foreground sm:px-6 md:px-8 md:py-32 lg:px-12 lg:py-40"
    >
      <div className="mx-auto max-w-[40rem] text-center">
        <h2
          data-reveal="about"
          className="reveal text-[1.7rem] leading-tight font-normal tracking-[0.01em] md:text-[2.15rem]"
        >
          {t("heading")}
        </h2>

        {/* The body sits a shade below the heading and the signature. That
            has to come from the colour, not element opacity, which the reveal
            tween animates to 1. */}
        <div className="mt-10 flex flex-col gap-7 md:mt-14 md:gap-8">
          {PARAGRAPHS.map((key) => (
            <p
              key={key}
              data-reveal="about"
              className="reveal text-[0.95rem] leading-[2.1] text-foreground/80 md:text-[1.05rem]"
            >
              {t(key)}
            </p>
          ))}
        </div>

        <p
          data-reveal="about"
          className="reveal mt-14 text-[1.05rem] leading-[1.9] md:mt-20 md:text-[1.2rem]"
        >
          {t("signature")}
        </p>
      </div>

      <ul className="mx-auto mt-20 grid max-w-md grid-cols-2 gap-5 md:mt-28 md:max-w-xl md:gap-10">
        {LOGO_SLOTS.map((slot) => (
          <li key={slot} data-reveal="about" className="reveal">
            <div className="tracked-label flex h-20 items-center justify-center border border-foreground/15 text-[0.62rem] tracking-[0.2em] uppercase opacity-40 md:h-24">
              {t("logo")}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
