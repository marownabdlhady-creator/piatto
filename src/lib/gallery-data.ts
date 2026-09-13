/**
 * The shape a photograph takes on the page.
 *
 * Deliberately free of any data source, like `@/lib/menu-data`: the set lives
 * in Postgres and is read by `@/lib/gallery`, which hands the components these.
 * `alt` arrives already resolved in the reader's language, so nothing on the
 * page has to know whether the wording came from the row or the message files.
 */
export type GalleryPhoto = {
  id: string;
  /** A path under public/ for the bundled set, or an absolute Blob URL. */
  url: string;
  alt: string;
  width: number;
  height: number;
};
