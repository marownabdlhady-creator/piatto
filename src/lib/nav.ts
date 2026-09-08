/**
 * Site navigation items. `key` resolves against the "nav" message namespace;
 * `href` points at the in-page section that will be built in a later step.
 */
export const navItems = [
  { key: "contact", href: "#contact" },
  { key: "workingHours", href: "#working-hours" },
  { key: "menu", href: "#menu" },
  { key: "about", href: "#about" },
  { key: "gallery", href: "#gallery" },
] as const;

export type NavItem = (typeof navItems)[number];

/** Native names for the language toggle — always shown in their own script. */
export const localeNames = {
  en: "English",
  ar: "العربية",
} as const;
