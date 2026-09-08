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

/**
 * Centre-out hairline that wipes in on hover. Shared by the dark action bar
 * and the off-white nav bar so both rows behave identically.
 */
export const navUnderline =
  "relative inline-block after:absolute after:inset-x-0 after:h-px after:origin-center " +
  "after:scale-x-0 after:bg-current after:transition-transform after:duration-500 " +
  "after:ease-[cubic-bezier(0.22,1,0.36,1)] after:content-[''] hover:after:scale-x-100";
