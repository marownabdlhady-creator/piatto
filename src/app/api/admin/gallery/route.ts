import { NextResponse } from "next/server";

import { fail, handle, readJson, unauthorized } from "@/lib/admin/api";
import {
  appendPhoto,
  deleteBlob,
  measureBlob,
  revalidateGallery,
} from "@/lib/admin/gallery";
import { recordPhotoInput } from "@/lib/admin/gallery-input";
import { firstIssue } from "@/lib/admin/item-input";

/**
 * Records a photograph that has just reached Blob, at the end of the gallery.
 *
 * The browser uploads the file itself — see the upload route — and then calls
 * this with where it landed. Only the URL is taken from the browser, and only
 * after it has been checked to be in this site's own store; the size and the
 * format are read from the file, because the masonry is laid out from those
 * numbers and because a file that is not an image must not become a row.
 *
 * A file that fails that check is deleted again rather than left in the store
 * paying rent for a photograph the gallery never had.
 */
export async function POST(request: Request) {
  return handle("POST /api/admin/gallery", async () => {
    const denied = await unauthorized();
    if (denied) return denied;

    const read = await readJson(request);
    if ("response" in read) return read.response;

    const parsed = recordPhotoInput.safeParse(read.body);
    if (!parsed.success) {
      return fail(firstIssue(parsed.error), 400);
    }

    const { url } = parsed.data;

    const measured = await measureBlob(url);
    if (!measured.ok) {
      await deleteBlob(url).catch((error: unknown) => {
        console.error("[admin api] could not remove a rejected upload:", error);
      });

      return fail(measured.message, 400);
    }

    const id = await appendPhoto({
      url,
      width: measured.width,
      height: measured.height,
    });

    revalidateGallery();

    return NextResponse.json({ id }, { status: 201 });
  });
}
