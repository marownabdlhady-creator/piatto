/**
 * The three rooms shown as full-bleed panels after the About section. Each
 * points at a placeholder route until its own page is built.
 */
export const spaces = [
  {
    key: "restaurant",
    href: "/restaurant",
    image: "/piatto-11.JPG",
  },
  {
    key: "privateRoom",
    href: "/private-room",
    image: "/family-paitto.JPG",
  },
  {
    key: "garden",
    href: "/garden",
    image: "/vibes-paitto.JPG",
  },
] as const;
