import "server-only";

import { revalidateTag } from "next/cache";
import { del } from "@vercel/blob";
import { imageSize } from "image-size";

import { ALLOWED_IMAGE_KINDS, MAX_UPLOAD_BYTES } from "@/lib/admin/gallery-input";
import type { EditorPhoto } from "@/lib/admin/gallery-types";
import { GALLERY_TAG } from "@/lib/gallery";
import { prisma } from "@/lib/prisma";

/**
 * The dashboard's side of the gallery: the same rows the public page reads,
 * uncached, since the point of the manager is to show what is in the table
 * right now.
 *
 * Prisma and the Blob token are imported here and only here on this path.
 * Everything below runs on the server; the manager receives plain objects.
 */

/** Every photograph, in the order the public page runs them. */
export async function readEditorGallery(): Promise<EditorPhoto[]> {
  return prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, url: true, alt: true, width: true, height: true, order: true },
  });
}

/**
 * Drops the cached gallery so /gallery picks the change up on its next request.
 *
 * `{ expire: 0 }` rather than `"max"`, for the same reason the menu uses it:
 * this runs in a Route Handler, where `updateTag` is not available, and
 * stale-while-revalidate would show the client the gallery they just changed
 * one visit late. Expiring outright costs the next visitor a render and makes
 * the upload or deletion live straight away, which is the whole point of the
 * button they just pressed.
 */
export function revalidateGallery(): void {
  revalidateTag(GALLERY_TAG, { expire: 0 });
}

/** Removes an uploaded file from the store. Already-gone is not an error. */
export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}

type Measured =
  | { ok: true; width: number; height: number }
  | { ok: false; message: string };

/**
 * The size of an uploaded photograph, read from the file itself.
 *
 * The masonry reserves every box from these two numbers, so they have to be
 * right, and they have to come from the bytes rather than from whatever the
 * browser claimed — this is also where a file that is not really an image is
 * caught, whatever it was uploaded as.
 *
 * A photograph taken with a phone on its side is stored landscape with an EXIF
 * flag saying to turn it; browsers honour that flag, so for those four
 * orientations the rendered image is the other way round from the stored one
 * and the two numbers are swapped to match what the page will actually show.
 */
export async function measureBlob(url: string): Promise<Measured> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return {
      ok: false,
      message: `The uploaded file could not be read back (HTTP ${response.status}).`,
    };
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "That file is larger than the upload limit." };
  }

  let size;
  try {
    size = imageSize(bytes);
  } catch {
    return { ok: false, message: "That file is not a JPG, PNG or WebP image." };
  }

  if (!size.type || !(ALLOWED_IMAGE_KINDS as readonly string[]).includes(size.type)) {
    return { ok: false, message: "That file is not a JPG, PNG or WebP image." };
  }

  if (!size.width || !size.height) {
    return { ok: false, message: "That image has no readable dimensions." };
  }

  const turned = size.orientation !== undefined && size.orientation >= 5;

  return {
    ok: true,
    width: turned ? size.height : size.width,
    height: turned ? size.width : size.height,
  };
}

/**
 * Writes a photograph to the end of the gallery.
 *
 * The position is read and written in one transaction, so two uploads landing
 * together cannot be given the same place in the run.
 */
export async function appendPhoto(photo: {
  url: string;
  width: number;
  height: number;
}): Promise<string> {
  const created = await prisma.$transaction(async (tx) => {
    const last = await tx.galleryImage.aggregate({ _max: { order: true } });

    return tx.galleryImage.create({
      data: { ...photo, order: (last._max.order ?? -1) + 1 },
      select: { id: true },
    });
  });

  return created.id;
}
