import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * Isolates the runs that carry digits. A phone number or a time range has no
 * strongly-directional characters of its own, so inside Arabic copy the bidi
 * algorithm would otherwise reorder its groups; the messages tag those runs
 * and this places them as one left-to-right island.
 */
const isolate = { n: (chunks: ReactNode) => <bdi dir="ltr">{chunks}</bdi> };

const HEADING =
  "tracked-label text-[0.66rem] tracking-[0.22em] uppercase md:text-[0.7rem]";

const LINES = "mt-6 space-y-2 text-[0.85rem] leading-[1.9] text-foreground/70";

/** The same empty plate the home teaser uses, stacked here from md. */
const PLATE =
  "tracked-label flex h-20 items-center justify-center border " +
  "border-foreground/15 text-[0.62rem] tracking-[0.2em] uppercase " +
  "opacity-40 md:h-24";

const LOGO_SLOTS = [0, 1];

/**
 * Site footer: the wordmark and address, opening hours, contact, and the two
 * empty logo plates at the inline end - a row of columns from md, a single
 * stack below it. Every string is a placeholder until the real details land.
 *
 * The pattern is a real image rather than a CSS background so it goes through
 * the image pipeline; it is decorative, and lazy, so it never competes with
 * the page above it.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const tCommon = await getTranslations("common");

  return (
    <footer className="relative isolate overflow-hidden border-t border-foreground/10 bg-background text-foreground">
      <Image
        src="/footr-piatto.png"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />

      <div className="px-4 py-20 sm:px-6 md:px-8 md:py-24 lg:px-12">
        <div className="mx-auto grid max-w-[84rem] gap-x-8 gap-y-14 md:grid-cols-12 md:gap-y-0">
          <div className="md:col-span-4">
            <p className="text-[1.45rem] leading-none tracking-[0.16em] lowercase md:text-[1.7rem]">
              {tCommon("siteName")}
            </p>

            <ul className={LINES}>
              <li>{t.rich("address", isolate)}</li>
              <li>{t.rich("tel", isolate)}</li>
              <li>{t.rich("fax", isolate)}</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className={HEADING}>{t("hours")}</h2>

            <ul className={LINES}>
              <li>{t.rich("hoursWeekdays", isolate)}</li>
              <li>{t.rich("hoursWeekend", isolate)}</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className={HEADING}>{t("contact")}</h2>

            <ul className={LINES}>
              <li>{t.rich("contactTel", isolate)}</li>
              <li>{t.rich("whatsapp", isolate)}</li>
            </ul>
          </div>

          <ul className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-1">
            {LOGO_SLOTS.map((slot) => (
              <li key={slot}>
                <div className={PLATE}>{t("logo")}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
