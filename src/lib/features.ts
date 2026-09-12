/**
 * The panels that run after the Spaces row. Each carries a title and links to
 * its own page. Drinks used to sit here too; it now lives inside /menu, so the
 * menu panel covers both.
 */
export const features = {
  menu: { href: "/menu", image: "/feature-menu.jpg" },
  about: { href: "/about", image: "/feature-about.jpg" },
} as const;
