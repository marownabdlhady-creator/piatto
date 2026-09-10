"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAdminStrings } from "./language";

/** Drops the session, then sends the browser back to the login page. */
export function LogoutButton() {
  const router = useRouter();
  const strings = useAdminStrings();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="tracked-label border border-foreground/25 px-6 py-3 text-[0.62rem] tracking-[0.2em] uppercase transition-colors duration-500 hover:border-foreground/70 disabled:opacity-40"
    >
      {pending ? strings.signingOut : strings.signOut}
    </button>
  );
}
