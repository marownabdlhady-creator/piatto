"use client";

import { useEffect, useState } from "react";

import { useAdminStrings } from "./language";
import { LABEL } from "./ui";

/**
 * The dashboard's one-line confirmation, and its one-line complaint.
 *
 * The menu editor grew its own copy of this before there was anywhere shared to
 * put it; this is that pattern lifted out so the gallery does not grow a third.
 */

export type Toast = {
  tone: "ok" | "error";
  message: string;
  /** Distinguishes two identical messages in a row, so the timer restarts. */
  serial: number;
};

/** How long a message stays up before it stops being news. */
const TOAST_MS = 4000;

let serialSeed = 0;

/**
 * Holds the current message and clears it once it has been read.
 *
 * A counter rather than a clock: reading the time is not something a component
 * may do while rendering, and a counter never repeats anyway.
 */
export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  function notify(tone: Toast["tone"], message: string) {
    serialSeed += 1;
    setToast({ tone, message, serial: serialSeed });
  }

  return { toast, notify };
}

export function ToastMessage({ toast }: { toast: Toast | null }) {
  const strings = useAdminStrings();

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto w-fit max-w-[calc(100%-2rem)] sm:mx-0 sm:end-6 sm:start-auto"
    >
      <p
        className={`rounded-[2px] border px-4 py-3 text-[0.8rem] leading-[1.5] shadow-[0_10px_30px_rgba(37,28,19,0.14)] ${
          toast.tone === "ok"
            ? "border-foreground/20 bg-background"
            : "border-[#8c2f22]/45 bg-background text-[#8c2f22]"
        }`}
      >
        <span className={LABEL}>
          {toast.tone === "ok" ? strings.toastSaved : strings.toastProblem}
        </span>
        <span className="mt-1 block">{toast.message}</span>
      </p>
    </div>
  );
}
