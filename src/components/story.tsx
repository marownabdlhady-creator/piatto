"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { RevealFallback } from "@/components/reveal-fallback";
import { storyImages } from "@/lib/story";
import { useParallax } from "@/lib/use-parallax";
import { useSoftReveal } from "@/lib/use-soft-reveal";
import { cn } from "@/lib/utils";

/** Everything on this page reveals as it arrives, text and images alike. */
const STORY_SELECTOR = "[data-reveal='story']";

const PARAGRAPHS = ["p1", "p2", "p3", "p4", "p5"] as const;

/** Both stills are held in the same frame the hero uses: inset, not bled. */
const PLATE = "mx-auto w-full max-w-[1600px]";

const FRAME =
  "reveal reveal-rise relative overflow-hidden bg-foreground/5 " +
  "aspect-[4/3] sm:aspect-[16/10] md:aspect-auto md:h-[72svh]";

type FrameProps = {
  image: string;
  eager?: boolean;
};

/**
 * One framed still. The image sits on its own layer, scaled a touch so the
 * parallax drift never pulls its edges into view; the frame itself carries the
 * entrance, so the two transforms never contend for the same element.
 */
function Frame({ image, eager = false }: FrameProps) {
  return (
    <div data-reveal="story" className={FRAME}>
      <span data-parallax className="absolute inset-0 block scale-[1.16]">
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="object-cover"
        />
      </span>
    </div>
  );
}

/**
 * The story page: an opening still, the story itself in one centred column
 * held to a reading measure, and a closing still. Nothing is asymmetric and
 * nothing is mirrored by hand - centred text and logical spacing read the
 * same in both directions, and the Latin "Piatto" inside the Arabic copy is
 * left to the bidi algorithm.
 */
export function Story() {
  const t = useTranslations("aboutPage");
  const rootRef = useRef<HTMLElement>(null);

  useSoftReveal(rootRef, STORY_SELECTOR);
  useParallax(rootRef);

  return (
    <article
      ref={rootRef}
      className="bg-background px-4 text-foreground sm:px-6 md:px-8 lg:px-12"
    >
      <RevealFallback />

      <div className={PLATE}>
        <Frame image={storyImages.interior} eager />
      </div>

      <div className="mx-auto max-w-[40rem] py-24 text-center md:py-36 lg:py-44">
        <h1
          data-reveal="story"
          className="reveal reveal-rise display-tight text-[clamp(2.3rem,7.5vw,4.6rem)] leading-[1.12] text-balance"
        >
          {t("heading")}
        </h1>

        {/* The body sits a shade below the heading and the signature. That has
            to come from the colour, not element opacity, which the reveal
            tween animates to 1. */}
        <div className="mt-12 flex flex-col gap-7 md:mt-16 md:gap-8">
          {PARAGRAPHS.map((key) => (
            <p
              key={key}
              data-reveal="story"
              className={cn(
                "reveal reveal-rise text-[0.95rem] leading-[2.1]",
                "text-pretty text-foreground/80 md:text-[1.05rem]",
              )}
            >
              {t(key)}
            </p>
          ))}
        </div>

        {/* Finale: set apart by the widest run of space on the page. */}
        <span
          data-reveal="story"
          aria-hidden="true"
          className="reveal reveal-rise mx-auto mt-20 block h-px w-16 bg-foreground/25 md:mt-28"
        />

        <p
          data-reveal="story"
          className="reveal reveal-rise mt-12 text-[1.15rem] leading-[1.8] text-balance md:mt-14 md:text-[1.45rem] md:leading-[1.7]"
        >
          {t("signature")}
        </p>
      </div>

      <div className={PLATE}>
        <Frame image={storyImages.table} />
      </div>

      {/* Room for the footer, which is built in a later step. */}
      <div className="h-24 md:h-32" />
    </article>
  );
}
