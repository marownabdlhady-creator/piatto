import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Text direction per locale, used for the <html dir> attribute. */
export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix the pathname with the locale, so "/" redirects to "/en".
  localePrefix: "always",
});
