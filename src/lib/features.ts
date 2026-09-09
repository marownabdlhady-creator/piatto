/**
 * The panels that run after the Spaces row. The three with an `href` carry a
 * title and link to a placeholder route; the other two are pictures only.
 */
export const features = {
  menu: { href: "/menu", image: "/feature-menu.jpg" },
  drinks: { href: "/drinks", image: "/feature-drinks.jpg" },
  about: { href: "/about", image: "/feature-about.jpg" },
  plate: { image: "/feature-decor-1.jpg" },
  room: { image: "/feature-decor-2.jpg" },
} as const;
