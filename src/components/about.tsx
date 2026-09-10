"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useRevealOnScroll } from "@/lib/use-reveal-on-scroll";

/**
 * The client's two images, the same pair the footer shows. The artwork is
 * square and so is its frame, so the border sits flush against the image with
 * nothing between them; `cover` keeps that true of anything dropped in later.
 */
const PLATE_IMAGES = ["/piatto-img1.jpg", "/piatto-img2.jpg"];

/**
 * The teaser for the story: two lines and a way through to the full page, over
 * an off-white ground with a row of image plates below. Centred text and
 * logical spacing keep it correct in both directions; the Latin "Piatto" in
 * the Arabic line is left to the bidi algorithm, which places it correctly
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
      className="bg-background px-4 py-20 text-foreground sm:px-6 md:px-8 md:py-28 lg:px-12"
    >
      {/* One centred group - two lines, the way through, then the plates - so
          the section reads as a single block with even air around it. */}
      <div className="mx-auto flex max-w-[44rem] flex-col items-center text-center">
        <p
          data-reveal="about"
          className="reveal text-[1.15rem] leading-[1.85] text-balance md:text-[1.45rem] md:leading-[1.8]"
        >
          {t("line1")}
        </p>

        {/* The second line sits a shade below the first. That has to come from
            the colour, not element opacity, which the reveal tween animates. */}
        <p
          data-reveal="about"
          className="reveal mt-7 text-[0.95rem] leading-[2] text-pretty text-foreground/70 md:mt-9 md:text-[1.05rem]"
        >
          {t("line2")}
        </p>

        <div data-reveal="about" className="reveal mt-10 md:mt-12">
          <Link
            href="/about"
            className="tracked-label inline-block border border-foreground/25 px-9 py-4 text-[0.66rem] tracking-[0.22em] uppercase transition-colors duration-500 hover:border-foreground/70"
          >
            {t("cta")}
          </Link>
        </div>

        {/* Two square frames side by side, centred as a pair. A flex row
            rather than a grid, because the frames are the size of the artwork
            now and a two-column grid would leave them adrift in their cells. */}
        <ul className="mt-14 flex items-center justify-center gap-5 md:mt-16 md:gap-10">
          {PLATE_IMAGES.map((src) => (
            <li key={src} data-reveal="about" className="reveal">
              <div className="relative size-20 overflow-hidden border border-foreground/15 md:size-24">
                {/* Decorative: the two lines above already say what this
                    section is about. */}
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
