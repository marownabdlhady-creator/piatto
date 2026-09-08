"use client";

import { useTranslations } from "next-intl";

import { LanguageToggle } from "@/components/language-toggle";
import { Link } from "@/i18n/navigation";
import { navUnderline } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Both rows fill the strip so the whole height is tappable. */
const slot = "flex h-full items-center";

const label = cn(
  navUnderline,
  "tracked-label uppercase after:-bottom-1 text-[0.62rem] tracking-[0.18em] md:text-[0.66rem] md:tracking-[0.2em]",
);

/**
 * Slim dark strip above the off-white nav bar: the reservation action on the
 * inline start, the language toggle on the inline end. Both mirror with the
 * locale because the row is laid out with logical direction, not sides.
 */
export function TopBar() {
  const t = useTranslations("nav");

  return (
    <div
      data-reveal="topbar"
      className="reveal relative z-30 h-[var(--bar-top-h)] bg-foreground text-background"
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12">
        <Link href="/reservations" className={slot}>
          <span className={label}>{t("reservations")}</span>
        </Link>

        <LanguageToggle
          label={t("switchLanguage")}
          className={cn(slot, "opacity-70 hover:opacity-100")}
          labelClassName={label}
        />
      </div>
    </div>
  );
}
