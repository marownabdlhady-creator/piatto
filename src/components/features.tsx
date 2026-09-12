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

/** The lead panel, and the shorter band that closes the run under it. */
const WIDE = "aspect-[3/2] md:aspect-auto md:h-[80svh]";
const BAND = "aspect-[3/2] md:aspect-auto md:h-[58svh]";

/**
 * The run of full-bleed panels after the Interlude: the two rooms of the site
 * anyone might be looking for, each behind its own picture. Menu leads on the
 * taller band - the drinks are part of it now - and About closes the run on a
 * shorter one, so the pair reads as a lead and its coda rather than two equal
 * blocks. Both are the full width, so there is nothing to mirror on /ar.
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

      <Panel
        image={features.about.image}
        href={features.about.href}
        title={t("about")}
        sizes="100vw"
        className={BAND}
      />
    </section>
  );
}
