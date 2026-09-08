/**
 * The three rooms shown as full-bleed panels after the About section. Each
 * points at a placeholder route until its own page is built.
 */
export const spaces = [
  {
    key: "restaurant",
    href: "/restaurant",
    image: "/space-restaurant.jpg",
  },
  {
    key: "privateRoom",
    href: "/private-room",
    image: "/space-private-room.jpg",
  },
  {
    key: "garden",
    href: "/garden",
    image: "/space-garden.jpg",
  },
] as const;
