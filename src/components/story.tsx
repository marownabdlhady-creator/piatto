"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { RevealFallback } from "@/components/reveal-fallback";
import { storyImages } from "@/lib/story";
import { useParallax } from "@/lib/use-parallax";
import { useSoftReveal } from "@/lib/use-soft-reveal";
import { cn } from "@/lib/utils";

/** Everything on this page reveals as it arrives, text and images alike. */
const STORY_SELECTOR = "[data-reveal='story']";

/** The measure the page is built on: twelve columns inside a wide margin. */
const ROW = "mx-auto grid max-w-[84rem] grid-cols-1 md:grid-cols-12 md:gap-x-8";

const FRAME = "reveal reveal-rise relative overflow-hidden bg-foreground/5";

const COPY =
  "reveal reveal-rise max-w-[34rem] text-[1rem] leading-[2.05] " +
  "text-pretty text-foreground/80 md:text-[1.075rem]";

type FrameProps = {
  image: string;
  sizes: string;
  className: string;
};

/**
 * One framed still. The image sits on its own layer, scaled a touch so the
 * parallax drift never pulls its edges into view; the frame itself carries the
 * entrance, so the two transforms never contend for the same element.
 */
function Frame({ image, sizes, className }: FrameProps) {
  return (
    <div data-reveal="story" className={cn(FRAME, className)}>
      <span data-parallax className="absolute inset-0 block scale-[1.16]">
        <Image src={image} alt="" fill sizes={sizes} className="object-cover" />
      </span>
    </div>
  );
}

function Copy({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p data-reveal="story" className={cn(COPY, className)}>
      {children}
    </p>
  );
}

/**
 * The story page: an oversized opening, a narrow reading column that shifts
 * from one side of the measure to the other, and stills interleaved between
 * the paragraphs at deliberately uneven widths. Column placement is logical,
 * so the whole asymmetry mirrors on /ar, where the Latin "Piatto" inside the
 * copy is left to the bidi algorithm.
 *
 * Everything stacks into a single column below md, in the order it is written.
 */
export function Story() {
  const t = useTranslations("aboutPage");
  const tCommon = useTranslations("common");
  const rootRef = useRef<HTMLElement>(null);

  useSoftReveal(rootRef, STORY_SELECTOR);
  useParallax(rootRef);

  return (
    <article
      ref={rootRef}
      className="bg-background px-4 pt-10 pb-28 text-foreground sm:px-6 md:px-8 md:pt-20 md:pb-40 lg:px-12"
    >
      <RevealFallback />

      {/* Opening: the title takes the measure, the first paragraph sits low
          against the opposite edge. */}
      <header className={ROW}>
        <h1
          data-reveal="story"
          className="reveal reveal-rise display-tight text-[clamp(2.9rem,10.5vw,8rem)] leading-[1.08] md:col-span-7"
        >
          {t("heading")}
        </h1>

        <Copy className="mt-10 md:col-span-4 md:col-start-9 md:mt-0 md:self-end">
          {t("p1")}
        </Copy>
      </header>

      <div className={cn(ROW, "mt-16 md:mt-32")}>
        <Frame
          image={storyImages.plate}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-[4/5] md:col-span-6"
        />
      </div>

      <div className={cn(ROW, "mt-16 md:mt-32")}>
        <Copy className="md:col-span-5 md:col-start-8">{t("p2")}</Copy>
      </div>

      {/* Uneven pair: the narrower still leads, the wider one hangs lower. */}
      <div className={cn(ROW, "mt-16 gap-y-6 md:mt-36")}>
        <Frame
          image={storyImages.pasta}
          sizes="(min-width: 768px) 40vw, 100vw"
          className="aspect-[3/4] md:col-span-5"
        />
        <Frame
          image={storyImages.oven}
          sizes="(min-width: 768px) 48vw, 100vw"
          className="aspect-[4/5] md:col-span-6 md:col-start-7 md:mt-28"
        />
      </div>

      <div className={cn(ROW, "mt-16 md:mt-36")}>
        <Copy className="md:col-span-5 md:col-start-2">{t("p3")}</Copy>
      </div>

      {/* The name, set as a plate of its own. Decorative: the wordmark is
          already announced by the bar above. */}
      <div className={cn(ROW, "mt-24 md:mt-44")}>
        <p
          data-reveal="story"
          aria-hidden="true"
          className="reveal reveal-rise text-center text-[clamp(4rem,18vw,14rem)] leading-[0.95] tracking-[-0.045em] lowercase md:col-span-12"
        >
          {tCommon("siteName")}
        </p>
      </div>

      <div className={cn(ROW, "mt-20 md:mt-36")}>
        <Frame
          image={storyImages.bread}
          sizes="100vw"
          className="aspect-[16/10] md:col-span-12 md:aspect-[2/1]"
        />
      </div>

      <div className={cn(ROW, "mt-16 md:mt-32")}>
        <Copy className="md:col-span-5 md:col-start-8">{t("p4")}</Copy>
      </div>

      <div className={cn(ROW, "mt-16 md:mt-36")}>
        <Frame
          image={storyImages.interior}
          sizes="(min-width: 768px) 75vw, 100vw"
          className="aspect-[4/3] md:col-span-9 md:col-start-4 md:aspect-[3/2]"
        />
      </div>

      <div className={cn(ROW, "mt-16 md:mt-32")}>
        <Copy className="md:col-span-5 md:col-start-2">{t("p5")}</Copy>
      </div>

      <div className={cn(ROW, "mt-16 md:mt-36")}>
        <Frame
          image={storyImages.table}
          sizes="(min-width: 768px) 75vw, 100vw"
          className="aspect-[4/3] md:col-span-9 md:aspect-[16/9]"
        />
      </div>

      {/* Finale: centred, alone, with the page's widest run of space above it. */}
      <div className="mx-auto mt-28 max-w-[46rem] text-center md:mt-52">
        <span
          data-reveal="story"
          aria-hidden="true"
          className="reveal reveal-rise mx-auto block h-px w-16 bg-foreground/25"
        />

        <p
          data-reveal="story"
          className="reveal reveal-rise mt-12 text-[1.25rem] leading-[1.8] text-balance md:mt-16 md:text-[1.6rem] md:leading-[1.7]"
        >
          {t("signature")}
        </p>
      </div>
    </article>
  );
}
