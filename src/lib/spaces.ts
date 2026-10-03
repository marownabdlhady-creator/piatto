/**
 * The three rooms shown as panels after the About section. Each opens the
 * gallery, where the rooms are photographed in full.
 *
 * `width` and `height` are the photographs as displayed (after their EXIF
 * rotation), so the stacked panels on small screens can take each picture's
 * own shape instead of cropping it.
 */
export const spaces = [
  {
    key: "restaurant",
    href: "/gallery",
    image: "/piatto-11.JPG",
    width: 3648,
    height: 5472,
  },
  {
    key: "privateRoom",
    href: "/gallery",
    image: "/family-paitto.JPG",
    width: 3648,
    height: 5472,
  },
  {
    key: "garden",
    href: "/gallery",
    image: "/vibes-paitto.JPG",
    width: 3648,
    height: 5472,
  },
] as const;
