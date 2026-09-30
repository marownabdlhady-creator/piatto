/**
 * The panels that run after the Spaces row. Each carries a title and links to
 * its own page. Drinks used to sit here too; it now lives inside /menu, so the
 * menu panel covers both.
 */
export const features = {
  menu: { href: "/menu", image: "/piatto-12.png" },
  about: { href: "/about", image: "/piatto-10.png" },
} as const;
