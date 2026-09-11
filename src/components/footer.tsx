import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/logo";
import { SocialLinks } from "@/components/social-links";
import { PHONE_DISPLAY, TEL_HREF, WHATSAPP_HREF } from "@/lib/contact";

/**
 * Isolates the runs that carry digits. A phone number or a time range has no
 * strongly-directional characters of its own, so inside Arabic copy the bidi
 * algorithm would otherwise reorder its groups; the messages tag those runs
 * and this places them as one left-to-right island.
 */
const isolate = { n: (chunks: ReactNode) => <bdi dir="ltr">{chunks}</bdi> };

/**
 * The same isolated run, made reachable: the number is the link and the label
 * beside it stays plain text, so only the part worth tapping is a target.
 * The number itself comes from one place, so the copy only carries its label.
 */
function phoneLine(href: string, external = false) {
  return {
    phone: PHONE_DISPLAY,
    n: (chunks: ReactNode) => (
      <a
        href={href}
        className="transition-opacity duration-300 hover:opacity-60"
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : null)}
      >
        <bdi dir="ltr">{chunks}</bdi>
      </a>
    ),
  };
}

const HEADING =
  "tracked-label text-[0.66rem] tracking-[0.22em] uppercase md:text-[0.7rem]";

const LINES = "mt-6 space-y-2 text-[0.85rem] leading-[1.9] text-foreground/70";

/** The same plate the home teaser uses, stacked here from md. */
const PLATE =
  "relative size-20 overflow-hidden border border-foreground/15 md:size-24";

/**
 * The client's two images, which repeat between here and the home teaser. The
 * artwork is square and so is its frame, so the border sits flush against the
 * image rather than standing off it.
 */
const PLATE_IMAGES = ["/piatto-img1.jpg", "/piatto-img2.jpg"];

/**
 * Site footer: the wordmark and address, opening hours, contact, and the two
 * image plates at the inline end - a row of columns from md, a single stack
 * below it. The address, fax and hours are still placeholders; the phone
 * number and the social accounts are the client's own.
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
            <Logo alt={tCommon("siteName")} className="h-20 w-auto md:h-24" />

            <ul className={LINES}>
              <li>{t.rich("address", isolate)}</li>
              <li>{t.rich("tel", phoneLine(TEL_HREF))}</li>
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
              <li>{t.rich("contactTel", phoneLine(TEL_HREF))}</li>
              <li>{t.rich("whatsapp", phoneLine(WHATSAPP_HREF, true))}</li>
            </ul>

            <SocialLinks className="mt-6" />
          </div>

          <ul className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-1">
            {PLATE_IMAGES.map((src) => (
              <li key={src}>
                <div className={PLATE}>
                  {/* Decorative: the plates carry no information the copy
                      beside them does not already give. */}
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
      </div>
    </footer>
  );
}
