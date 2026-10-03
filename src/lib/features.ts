/**
 * The panels that run after the Spaces row. Each carries a title and links to
 * its own page. Drinks used to sit here too; it now lives inside /menu, so the
 * menu panel covers both.
 *
 * `position` is the crop focus for the portrait photos in the wide panels.
 */
export const features = {
  menu: {
    href: "/menu",
    image: "/menu-feature.jpg",
    position: "object-center",
  },
  about: {
    href: "/about",
    image: "/about-feature.jpg",
    position: "object-[50%_60%]",
  },
} as const;
