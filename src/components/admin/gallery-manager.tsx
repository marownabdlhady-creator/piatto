"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

import {
  ALLOWED_IMAGE_TYPES,
  blobPathname,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
} from "@/lib/admin/gallery-input";
import type { EditorPhoto } from "@/lib/admin/gallery-types";

import { useAdminStrings } from "./language";
import { jsonBody, send } from "./send";
import { ToastMessage, useToast } from "./toast";
import { BUTTON_DANGER, BUTTON_SMALL, BUTTON_SOLID, LABEL } from "./ui";

/**
 * The gallery manager: what is on the public page, with a way to add to it and
 * a way to take something off it.
 *
 * Files go from the browser straight to Blob, signed by the upload route, and
 * only then is the server told where one landed — a photograph off a camera is
 * bigger than a serverless request body is allowed to be, so routing the bytes
 * through the API would have put a few megabytes' ceiling on the whole feature.
 *
 * After any write the component asks the server component above it to re-render
 * rather than patching its own copy: the table is the truth, and a grid rebuilt
 * from it cannot drift out of step with what was actually saved.
 *
 * Ordering is not editable here. New photographs are appended, which is the
 * order the public page runs them in.
 */

/** One file on its way up, as the list under the button shows it. */
type Upload = {
  key: string;
  name: string;
  percentage: number;
};

/** The name a photograph goes by in the grid: the file it was uploaded as. */
function fileName(url: string): string {
  try {
    const { pathname } = new URL(url, "https://example.invalid");
    return decodeURIComponent(pathname.split("/").pop() ?? url);
  } catch {
    return url;
  }
}

/** Distinguishes two files chosen together that happen to share a name. */
function uploadKey(file: File, index: number): string {
  return `${index}:${file.name}:${file.lastModified}`;
}

export function GalleryManager({ photos }: { photos: EditorPhoto[] }) {
  const router = useRouter();
  const strings = useAdminStrings();
  const { toast, notify } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  /** The photograph whose Delete has been pressed once, awaiting a second. */
  const [confirming, setConfirming] = useState<string | null>(null);
  /** The row with a request in flight, so only its buttons go quiet. */
  const [busy, setBusy] = useState<string | null>(null);

  const uploading = uploads.length > 0;

  /**
   * Whatever a failed upload threw, as a sentence.
   *
   * The SDK fetches the token from our upload route itself and reports only
   * that it could not get one, so the reason the route gave — almost always a
   * session that ran out — never reaches here. That one case is rephrased into
   * something worth reading; every other failure already says what went wrong
   * (a file too large for the token, a refused type, a dropped connection) and
   * is passed straight through.
   */
  function reason(error: unknown): string {
    const detail = error instanceof Error ? error.message : String(error);

    if (detail.includes("client token")) return strings.uploadNotAllowed;

    return detail.trim() || strings.unexpectedError;
  }

  /** Why this file cannot be uploaded, or null when it can. */
  function reject(file: File): string | null {
    if (!isAllowedImageType(file.type)) {
      return strings.fileNotImage(file.name);
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return strings.fileTooLarge(file.name, MAX_UPLOAD_MB);
    }
    return null;
  }

  /** The error to report against this file, or null once it is a row. */
  async function uploadFile(file: File, key: string): Promise<string | null> {
    try {
      const blob = await upload(blobPathname(file.name), file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: "/api/admin/gallery/upload",
        onUploadProgress: ({ percentage }) => {
          setUploads((current) =>
            current.map((entry) =>
              entry.key === key ? { ...entry, percentage } : entry,
            ),
          );
        },
      });

      // The file is in the store now; nothing shows it until the row exists.
      return await send(
        "/api/admin/gallery",
        jsonBody("POST", { url: blob.url, pathname: blob.pathname }),
        strings,
      );
    } catch (error) {
      return reason(error);
    }
  }

  async function onChosen(chosen: FileList | null) {
    const files = Array.from(chosen ?? []);

    // Cleared straight away, so the same file can be chosen again after a
    // failure without having to pick something else in between.
    if (inputRef.current) inputRef.current.value = "";

    if (files.length === 0 || uploading) return;

    setConfirming(null);

    // Checked here so an obvious refusal is instant; the routes check again,
    // and it is their answer that decides.
    const failures: string[] = [];
    const queue = files.filter((file) => {
      const problem = reject(file);
      if (problem) failures.push(problem);
      return problem === null;
    });

    setUploads(
      queue.map((file, index) => ({
        key: uploadKey(file, index),
        name: file.name,
        percentage: 0,
      })),
    );

    let added = 0;

    // One at a time: the progress line then means something, and a phone on a
    // slow connection is not helped by four uploads competing for it.
    for (const [index, file] of queue.entries()) {
      const key = uploadKey(file, index);
      const failure = await uploadFile(file, key);

      if (failure) failures.push(strings.uploadFailed(file.name, failure));
      else added += 1;

      setUploads((current) => current.filter((entry) => entry.key !== key));
    }

    setUploads([]);

    if (added > 0) {
      notify("ok", strings.imagesAdded(added));
      router.refresh();
    }

    if (failures.length > 0) notify("error", failures.join(" "));
  }

  async function deletePhoto(photo: EditorPhoto) {
    if (busy) return;
    setBusy(photo.id);

    const failure = await send(
      `/api/admin/gallery/${photo.id}`,
      { method: "DELETE" },
      strings,
    );

    setBusy(null);
    setConfirming(null);

    if (failure) {
      notify("error", failure);
      // The row may be gone for a reason the grid does not know about yet.
      router.refresh();
      return;
    }

    notify("ok", strings.imageDeleted);
    router.refresh();
  }

  return (
    <div>
      <p className="max-w-[38rem] text-[0.82rem] leading-[1.8] text-foreground/50">
        {strings.galleryIntro}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        {/* The input is the control and the label is what it looks like, so it
            is styled rather than hidden: it can still be tabbed to and opened
            from the keyboard. */}
        <label
          className={`${BUTTON_SOLID} inline-block cursor-pointer focus-within:opacity-80 ${
            uploading ? "pointer-events-none opacity-40" : ""
          }`}
        >
          {uploading ? strings.uploading : strings.uploadImages}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            disabled={uploading}
            onChange={(event) => onChosen(event.currentTarget.files)}
            className="sr-only"
          />
        </label>

        <p className="text-[0.75rem] text-foreground/45">
          {strings.uploadHint(MAX_UPLOAD_MB)}
        </p>
      </div>

      {uploading && (
        <ul aria-live="polite" className="mt-6 grid gap-3">
          {uploads.map((entry) => (
            <li key={entry.key} className="max-w-[26rem]">
              <p className="flex items-baseline justify-between gap-4 text-[0.78rem]">
                <span dir="auto" className="min-w-0 truncate text-foreground/70">
                  {entry.name}
                </span>
                <span dir="ltr" className="tabular-nums text-foreground/45">
                  {entry.percentage}%
                </span>
              </p>
              <span
                aria-hidden="true"
                className="mt-1.5 block h-px w-full bg-foreground/15"
              >
                <span
                  className="block h-px bg-foreground transition-[width] duration-300"
                  style={{ width: `${entry.percentage}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}

      {photos.length === 0 ? (
        <p className="mt-12 text-[0.86rem] leading-[1.9] text-foreground/55">
          {strings.noImages}
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => {
            const pending = busy === photo.id;
            const name = fileName(photo.url);

            return (
              <li
                key={photo.id}
                className={`transition-opacity duration-200 ${
                  pending ? "opacity-40" : ""
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-foreground/5">
                  <Image
                    src={photo.url}
                    alt={photo.alt ?? name}
                    fill
                    sizes="(min-width: 64rem) 14rem, (min-width: 40rem) 20vw, 45vw"
                    className="object-cover"
                  />
                </div>

                <p
                  dir="auto"
                  title={name}
                  className="mt-2 truncate text-[0.72rem] text-foreground/45"
                >
                  {name}
                </p>

                {confirming === photo.id ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[0.72rem] text-foreground/60">
                      {strings.confirmDelete}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      disabled={pending}
                      className={BUTTON_SMALL}
                    >
                      {strings.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePhoto(photo)}
                      disabled={pending}
                      className={BUTTON_DANGER}
                    >
                      {pending ? strings.deleting : strings.delete}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(photo.id)}
                    disabled={pending}
                    className={`${BUTTON_DANGER} mt-2`}
                  >
                    {strings.delete}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {photos.length > 0 && (
        <p className={`${LABEL} mt-10`}>{strings.appendedNote}</p>
      )}

      <ToastMessage toast={toast} />
    </div>
  );
}
