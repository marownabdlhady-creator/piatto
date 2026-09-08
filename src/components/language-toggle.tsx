"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { localeNames } from "@/lib/nav";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LanguageToggleProps = {
  className?: string;
  label: string;
  onNavigate?: () => void;
};

/**
 * Switches between /en and /ar while staying on the current path.
 * `usePathname` from the next-intl navigation helpers returns the pathname
 * without the locale prefix, so the same href works for both locales.
 */
export function LanguageToggle({
  className,
  label,
  onNavigate,
}: LanguageToggleProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const target: Locale = locale === "en" ? "ar" : "en";

  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      aria-label={label}
      onClick={onNavigate}
      className={cn("transition-opacity duration-500", className)}
    >
      {localeNames[target]}
    </Link>
  );
}
