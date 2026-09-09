"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { ReservationForm } from "@/components/reservation-form";
import { RevealFallback } from "@/components/reveal-fallback";
import { useSoftReveal } from "@/lib/use-soft-reveal";

/** The room, laid and lit for the evening the table is being booked for. */
const IMAGE = "/reservations-hero.jpg";

/**
 * The reservation page: the room on one side, the form on the other, side by
 * side from md and stacked below it. Nothing is mirrored by hand - the columns
 * are grid order and the spacing is logical, so on /ar the picture takes the
 * right-hand side and the form reads from the right.
 */
export function Reservation() {
  const t = useTranslations("reservations");
  const rootRef = useRef<HTMLDivElement>(null);

  useSoftReveal(rootRef);

  return (
    <div
      ref={rootRef}
      className="px-4 pt-14 sm:px-6 md:px-8 md:pt-20 lg:px-12"
    >
      <RevealFallback />

      <div className="mx-auto grid w-full max-w-[92rem] gap-y-14 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
        <div
          data-reveal="panel"
          className="reveal reveal-rise relative aspect-[4/3] overflow-hidden bg-foreground/5 sm:aspect-[16/10] md:aspect-auto md:min-h-[38rem]"
        >
          <Image
            src={IMAGE}
            alt={t("imageAlt")}
            fill
            sizes="(min-width: 768px) 46vw, 100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
        </div>

        <div className="md:py-2">
          <header data-reveal="panel" className="reveal reveal-rise">
            <h1 className="display-tight text-[clamp(2.3rem,6.5vw,3.8rem)] leading-[1.14] text-balance">
              {t("heading")}
            </h1>

            <span
              aria-hidden="true"
              className="mt-10 block h-px w-16 bg-foreground/25"
            />

            <p className="mt-10 max-w-[34rem] text-[0.9rem] leading-[1.95] text-pretty text-foreground/60">
              {t("intro")}
            </p>
          </header>

          <div
            data-reveal="panel"
            className="reveal reveal-rise mt-14 md:mt-16"
          >
            <ReservationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
