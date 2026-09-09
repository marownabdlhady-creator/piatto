"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { RevealFallback } from "@/components/reveal-fallback";
import { Link } from "@/i18n/navigation";
import { features } from "@/lib/features";
import { useSoftReveal } from "@/lib/use-soft-reveal";
import { cn } from "@/lib/utils";

type PanelProps = {
  image: string;
  sizes: string;
  className: string;
  /** Present on the titled panels, which are the ones that link out. */
  title?: string;
  href?: string;
};

/**
 * One image panel: the image under a scrim, with an optional centred title.
 */
function Panel({ image, sizes, className, title, href }: PanelProps) {
  const shell = cn(
    "reveal reveal-rise relative block overflow-hidden bg-foreground",
    className,
  );

  const body = (
    <span className="absolute inset-0 block">
      <Image src={image} alt="" fill sizes={sizes} className="object-cover" />

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/25"
      />

      {title ? (
        <span className="absolute inset-0 flex items-center justify-center px-6">
          <span className="tracked-label text-center text-[1.05rem] tracking-[0.26em] text-white uppercase md:text-[1.2rem]">
            {title}
          </span>
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} data-reveal="panel" className={shell}>
        {body}
      </Link>
    );
  }

  // Decorative: it carries no title and goes nowhere, so it is not a link and
  // has nothing to announce.
  return (
    <div data-reveal="panel" aria-hidden="true" className={shell}>
      {body}
    </div>
  );
}

const WIDE = "aspect-[3/2] md:aspect-auto md:h-[80svh]";
const ROW_CELL = "aspect-[4/3] md:aspect-auto md:h-[70svh]";
const BAND = "aspect-[3/2] md:aspect-auto md:h-[70svh]";

/**
 * The run of full-bleed panels after the Spaces row: a titled panel, a
 * two-image row of uneven widths, another titled panel, then a decorative one.
 * Everything is edge to edge with no gaps, and stacks on small screens. Static
 * by design - no hover state.
 */
export function Features() {
  const t = useTranslations("features");
  const rootRef = useRef<HTMLElement>(null);

  useSoftReveal(rootRef);

  return (
    <section id="features" ref={rootRef}>
      <RevealFallback />

      <Panel
        image={features.menu.image}
        href={features.menu.href}
        title={t("menu")}
        sizes="100vw"
        className={WIDE}
      />

      {/* Uneven pair: the titled half is the wider one. The columns follow the
          inline direction, so the pair mirrors on /ar. */}
      <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr]">
        <Panel
          image={features.drinks.image}
          href={features.drinks.href}
          title={t("drinks")}
          sizes="(min-width: 768px) 54vw, 100vw"
          className={ROW_CELL}
        />
        <Panel
          image={features.plate.image}
          sizes="(min-width: 768px) 46vw, 100vw"
          className={ROW_CELL}
        />
      </div>

      <Panel
        image={features.about.image}
        href={features.about.href}
        title={t("about")}
        sizes="100vw"
        className={WIDE}
      />

      <Panel image={features.room.image} sizes="100vw" className={BAND} />
    </section>
  );
}
