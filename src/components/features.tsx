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
  title: string;
  href: string;
};

/**
 * One image panel: the image under a scrim, with its title centred over it.
 */
function Panel({ image, sizes, className, title, href }: PanelProps) {
  return (
    <Link
      href={href}
      data-reveal="panel"
      className={cn(
        "reveal reveal-rise relative block overflow-hidden bg-foreground",
        className,
      )}
    >
      <span className="absolute inset-0 block">
        <Image src={image} alt="" fill sizes={sizes} className="object-cover" />

        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/25"
        />

        <span className="absolute inset-0 flex items-center justify-center px-6">
          <span className="tracked-label text-center text-[1.05rem] tracking-[0.26em] text-white uppercase md:text-[1.2rem]">
            {title}
          </span>
        </span>
      </span>
    </Link>
  );
}

const WIDE = "aspect-[3/2] md:aspect-auto md:h-[80svh]";
const HALF = "aspect-[3/2] md:aspect-auto md:h-[70svh]";

/**
 * The run of full-bleed panels after the Interlude: the three rooms of the
 * site anyone might be looking for, each behind its own picture. Menu takes
 * the full width; Drinks and About share the row below it, splitting it in
 * half from md and stacking under each other below that. The columns follow
 * the inline direction, so the pair mirrors on /ar.
 *
 * Everything is edge to edge with no gaps. Static by design - no hover state.
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

      <div className="grid grid-cols-1 md:grid-cols-2">
        <Panel
          image={features.drinks.image}
          href={features.drinks.href}
          title={t("drinks")}
          sizes="(min-width: 768px) 50vw, 100vw"
          className={HALF}
        />

        <Panel
          image={features.about.image}
          href={features.about.href}
          title={t("about")}
          sizes="(min-width: 768px) 50vw, 100vw"
          className={HALF}
        />
      </div>
    </section>
  );
}
