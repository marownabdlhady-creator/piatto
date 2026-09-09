/**
 * The gallery set, in the order it runs down the page. Each still is cropped
 * to one of a handful of ratios so the masonry keeps a deliberate rhythm, and
 * the intrinsic size travels with the path: next/image reserves the box from
 * it, so nothing shifts as the photographs arrive.
 *
 * `key` resolves against the "galleryPage.alt" message namespace.
 */
export type GalleryImage = {
  key: string;
  src: string;
  width: number;
  height: number;
};

export const galleryImages: readonly GalleryImage[] = [
  { key: "served", src: "/gallery-1.jpg", width: 1200, height: 1500 },
  { key: "pasta", src: "/gallery-2.jpg", width: 1200, height: 900 },
  { key: "room", src: "/gallery-3.jpg", width: 1200, height: 800 },
  { key: "bread", src: "/gallery-4.jpg", width: 1200, height: 1200 },
  { key: "pizza", src: "/gallery-5.jpg", width: 1200, height: 1500 },
  { key: "guests", src: "/gallery-6.jpg", width: 1200, height: 800 },
  { key: "cocktail", src: "/gallery-7.jpg", width: 1200, height: 1500 },
  { key: "table", src: "/gallery-8.jpg", width: 1200, height: 1200 },
  { key: "hall", src: "/gallery-9.jpg", width: 1200, height: 900 },
  { key: "window", src: "/gallery-10.jpg", width: 1200, height: 800 },
  { key: "aperitivo", src: "/gallery-11.jpg", width: 1200, height: 1200 },
  { key: "toast", src: "/gallery-12.jpg", width: 1200, height: 1500 },
];
