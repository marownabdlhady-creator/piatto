"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useRevealOnScroll } from "@/lib/use-reveal-on-scroll";

/** An evening table, set and waiting - the picture the invitation rests on. */
const IMAGE = "/reserve-table.jpg";

/**
 * The invitation that closes the page: a full-bleed table under a scrim, with
 * the heading, one line and the way to the reservations page centred over it.
 * Everything is centred and logically spaced, so it reads the same in both
 * directions.
 */
export function Reserve() {
  const t = useTranslations("reserve");
  const rootRef = useRef<HTMLElement>(null);

  useRevealOnScroll(rootRef, "[data-reveal='reserve']");

  return (
    <section
      id="reserve"
      ref={rootRef}
      className="relative overflow-hidden bg-foreground"
    >
      <Image
        src={IMAGE}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />

      <span aria-hidden="true" className="absolute inset-0 bg-black/55" />

      <div className="relative flex min-h-[68svh] flex-col items-center justify-center px-6 py-24 text-center text-white md:min-h-[74svh] md:px-8 md:py-32">
        <h2
          data-reveal="reserve"
          className="reveal display-tight text-[clamp(2.1rem,6.5vw,4rem)] leading-[1.15] text-balance"
        >
          {t("heading")}
        </h2>

        <p
          data-reveal="reserve"
          className="reveal mt-6 max-w-[34rem] text-[0.95rem] leading-[1.95] text-balance text-white/75 md:mt-8 md:text-[1.05rem]"
        >
          {t("line")}
        </p>

        <div data-reveal="reserve" className="reveal mt-10 md:mt-12">
          <Link
            href="/reservations"
            className="tracked-label inline-block border border-white/40 px-9 py-4 text-[0.66rem] tracking-[0.22em] uppercase transition-colors duration-500 hover:border-white/80"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
