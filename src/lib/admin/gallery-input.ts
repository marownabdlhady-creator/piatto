import { z } from "zod";

/**
 * What counts as a gallery upload, and the only definition of it.
 *
 * Deliberately free of `server-only` and of Prisma: the manager imports it in
 * the browser to turn a file away before it is sent anywhere, and the routes
 * import the same limits to enforce them — the token route as it signs an
 * upload, the record route as it looks at what actually landed. The browser
 * copy is a courtesy; nothing on the server assumes it ran.
 */

/** The three formats the public gallery is built for. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** What those three are called once the bytes themselves have been read. */
export const ALLOWED_IMAGE_KINDS = ["jpg", "png", "webp"] as const;

/** Roomy enough for a photograph straight off a camera, and no more. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);

/** Everything the dashboard uploads lands under here, and nothing else may. */
export const GALLERY_BLOB_PREFIX = "gallery/";

/**
 * The store's own host. Blob serves every public blob from a subdomain of it,
 * and it is the same host next.config.ts allows next/image to fetch from.
 */
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isAllowedImageType(type: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

/**
 * Whether a URL points at our own Blob store.
 *
 * The record route asks before it trusts a URL the browser handed it, and the
 * delete route asks before it tries to delete anything: the twelve photographs
 * that ship in public/ are rows like any other, but there is no blob behind
 * them to remove.
 */
export function isBlobUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/**
 * What the manager sends once a file has reached Blob: where it landed, so the
 * server can go and look at it. Nothing about the image itself is taken from
 * here — the size and the format are read off the bytes.
 */
export const recordPhotoInput = z.object({
  url: z
    .url({ error: "Expected the URL of the uploaded file." })
    .refine(isBlobUrl, "That file is not in this site's blob store."),
  pathname: z
    .string()
    .trim()
    .min(1, "The uploaded file has no path.")
    .startsWith(GALLERY_BLOB_PREFIX, "That file is not a gallery upload."),
});

export type RecordPhotoInput = z.infer<typeof recordPhotoInput>;

/** The id in the path of a delete, checked before it reaches the database. */
export const photoIdInput = z
  .string()
  .trim()
  .min(1, "A photograph id is required.");

/**
 * A filename Blob and the browser's address bar can both live with: the
 * original name, stripped of anything that would read as a path.
 */
export function blobPathname(fileName: string): string {
  const cleaned = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);

  return `${GALLERY_BLOB_PREFIX}${cleaned || "photograph.jpg"}`;
}
