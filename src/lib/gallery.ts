import { unstable_cache } from "next/cache";
import { getTranslations } from "next-intl/server";

import type { GalleryPhoto } from "@/lib/gallery-data";
import { prisma } from "@/lib/prisma";

/**
 * The gallery's cache tag. Both languages of the page carry it, so once the
 * dashboard can add and remove photographs, a single
 * `revalidateTag(GALLERY_TAG, { expire: 0 })` drops the English and Arabic
 * pages together — the same arrangement the menus use.
 */
export const GALLERY_TAG = "gallery";

/**
 * How long a rendered gallery may be served before it is refreshed in the
 * background. The page repeats this as its route `revalidate`, which has to be
 * a literal there, so the two are kept in step by hand.
 */
export const GALLERY_REVALIDATE_SECONDS = 60;

/**
 * Which message under "galleryPage.alt" describes each photograph that ships
 * in public/.
 *
 * Those twelve are described in both languages in the message files, and the
 * column holds a single string, so flattening them into it would leave /ar
 * reading English to a screen reader. They keep their translations here; an
 * uploaded photograph carries its own `alt` instead, and anything with neither
 * falls back to a general description.
 */
const BUNDLED_ALT_KEYS: Record<string, string> = {
  "/gallery-1.jpg": "served",
  "/gallery-2.jpg": "pasta",
  "/gallery-3.jpg": "room",
  "/gallery-4.jpg": "bread",
  "/gallery-5.jpg": "pizza",
  "/gallery-6.jpg": "guests",
  "/gallery-7.jpg": "cocktail",
  "/gallery-8.jpg": "table",
  "/gallery-9.jpg": "hall",
  "/gallery-10.jpg": "window",
  "/gallery-11.jpg": "aperitivo",
  "/gallery-12.jpg": "toast",
};

/** Read when a row has no alt text of its own and is not one of the bundled set. */
const FALLBACK_ALT_KEY = "fallback";

/**
 * The set as it is stored: in display order, with ties broken by age so the
 * run is stable when two rows share a position.
 */
function readGallery() {
  return prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, url: true, alt: true, width: true, height: true },
  });
}

/**
 * Wraps the read in the data cache under the gallery's tag.
 *
 * `unstable_cache` is the pre-Cache-Components API and is on its way out; it is
 * what this app can use until `cacheComponents` is turned on, at which point
 * this becomes a `"use cache"` function with the same tag. Only the rows are
 * cached — the wording is resolved per request, outside the cache scope, since
 * it depends on the locale the page is being rendered in.
 */
const loadGallery = unstable_cache(readGallery, ["gallery"], {
  tags: [GALLERY_TAG],
  revalidate: GALLERY_REVALIDATE_SECONDS,
});

/** The photographs /gallery runs, in order, described in `locale`. */
export async function getGalleryPhotos(
  locale: string,
): Promise<GalleryPhoto[]> {
  const [rows, t] = await Promise.all([
    loadGallery(),
    getTranslations({ locale, namespace: "galleryPage" }),
  ]);

  return rows.map((row) => ({
    id: row.id,
    url: row.url,
    width: row.width,
    height: row.height,
    alt:
      row.alt?.trim() ||
      t(`alt.${BUNDLED_ALT_KEYS[row.url] ?? FALLBACK_ALT_KEY}`),
  }));
}
