import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { fail, handle, readJson, unauthorized } from "@/lib/admin/api";
import {
  ALLOWED_IMAGE_TYPES,
  GALLERY_BLOB_PREFIX,
  MAX_UPLOAD_BYTES,
} from "@/lib/admin/gallery-input";

/**
 * Signs a single upload, so the browser can send the file straight to Blob.
 *
 * The file never passes through this function, which is the point: a serverless
 * request body is capped at a few megabytes, and a photograph off a camera is
 * routinely larger than that. What the browser gets instead is a short-lived
 * token that only allows one upload, under gallery/, of an image type we accept
 * and no larger than the limit — the store's read-write token stays here.
 *
 * The route answers two different callers, which is what `handleUpload` is for:
 * the browser asking for a token, and Blob itself reporting a finished upload.
 * Only the first is a person with a session; the callback comes from Vercel and
 * carries a signature over the store token, which `handleUpload` checks. So the
 * session is required for the token request alone — demanding a cookie of the
 * callback would reject every one of them.
 */
export async function POST(request: Request) {
  return handle("POST /api/admin/gallery/upload", async () => {
    const read = await readJson(request);
    if ("response" in read) return read.response;

    const body = read.body as HandleUploadBody;

    if (body.type !== "blob.upload-completed") {
      const denied = await unauthorized();
      if (denied) return denied;
    }

    try {
      const result = await handleUpload({
        request,
        body,
        onBeforeGenerateToken: async (pathname) => {
          // The browser chooses the filename, so the folder is checked rather
          // than assumed: a token is for the gallery or it is for nothing.
          if (!pathname.startsWith(GALLERY_BLOB_PREFIX)) {
            throw new Error("Gallery uploads must go under gallery/.");
          }

          return {
            allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            // Two photographs called the same thing are two photographs; the
            // suffix is what keeps the second from overwriting the first.
            addRandomSuffix: true,
          };
        },
        // Nothing is hooked to the completion callback on purpose. It is a
        // request from Vercel to a public URL, which does not exist while the
        // site is being developed, so the row is written by the record route
        // below instead — which the browser calls, with its session, the moment
        // the upload resolves.
      });

      return NextResponse.json(result);
    } catch (error) {
      // Everything `handleUpload` rejects is about this request: an unsigned
      // callback, a pathname outside the gallery, a file too big for the token.
      const detail = error instanceof Error ? error.message : String(error);
      return fail(detail || "That upload was refused.", 400);
    }
  });
}
