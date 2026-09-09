/**
 * One navigation destination. Anchors point at a section of the home page;
 * entries flagged `route` are pages of their own and have to go through the
 * locale-aware Link, so the /en or /ar prefix is carried across.
 */
export type NavLink = {
  key: string;
  href: string;
  route?: boolean;
};

/** Site navigation items. `key` resolves against the "nav" message namespace. */
export const navItems: readonly NavLink[] = [
  { key: "contact", href: "#contact" },
  { key: "workingHours", href: "#working-hours" },
  { key: "menu", href: "/menu", route: true },
  { key: "about", href: "#about" },
  { key: "gallery", href: "/gallery", route: true },
];

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

/** Hairline colour used to divide the dark shortcut cells. */
export const darkCellRule = "border-background/20";

/** Shared type treatment for the dark shortcut cells, grid and compact bar. */
export const darkCell =
  "tracked-label flex items-center justify-center px-3 text-center " +
  "text-[0.62rem] tracking-[0.18em] uppercase opacity-80 " +
  "transition-opacity duration-500 hover:opacity-100";

/**
 * Curated shortcuts: the 2x2 grid under the action strip on small screens,
 * and the visible row in the desktop bar. The WhatsApp entry is a placeholder
 * anchor until the real wa.me link exists.
 */
export const quickLinks: readonly NavLink[] = [
  { key: "menu", href: "/menu", route: true },
  { key: "gallery", href: "/gallery", route: true },
  { key: "about", href: "#about" },
  { key: "whatsapp", href: "#whatsapp" },
];

/**
 * The three shortcuts that survive into the collapsed small-screen bar. Home
 * leads, so the way back out of a section page is the first thing in reach.
 */
export const compactLinks: readonly NavLink[] = [
  { key: "home", href: "/", route: true },
  { key: "menu", href: "/menu", route: true },
  { key: "whatsapp", href: "#whatsapp" },
];
