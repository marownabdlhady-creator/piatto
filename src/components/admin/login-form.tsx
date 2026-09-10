"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAdminStrings } from "./language";

const FIELD =
  "mt-3 block w-full border border-foreground/20 bg-transparent px-4 py-3 " +
  "text-[0.9rem] outline-none transition-colors duration-300 " +
  "placeholder:text-foreground/30 focus:border-foreground/60";

const LABEL =
  "tracked-label text-[0.6rem] tracking-[0.18em] uppercase opacity-45";

/**
 * The sign-in form. The server answers every bad attempt the same way, so
 * there is only ever one message to show and nothing to highlight per field.
 */
export function LoginForm() {
  const router = useRouter();
  const strings = useAdminStrings();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (!response.ok) {
        setError(strings.invalidCredentials);
        setPending(false);
        return;
      }

      // replace, so the back button does not land on a form that is now
      // signed in; refresh, so the layout re-reads the new cookie.
      router.replace("/admin");
      router.refresh();
    } catch {
      setError(strings.networkError);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label className="block">
        <span className={LABEL}>{strings.email}</span>
        {/* Credentials are typed in Latin script whatever the interface
            language is, so both fields stay left-to-right. */}
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          dir="ltr"
          className={FIELD}
        />
      </label>

      <label className="mt-8 block">
        <span className={LABEL}>{strings.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className={FIELD}
        />
      </label>

      {/* Kept in the flow whether or not it is filled, so the button does not
          jump when a message appears. */}
      <p
        role="alert"
        aria-live="polite"
        className="mt-6 min-h-[1.2rem] text-[0.78rem] leading-[1.6] text-foreground/60"
      >
        {error}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="tracked-label mt-4 w-full border border-foreground/25 px-9 py-4 text-[0.66rem] tracking-[0.22em] uppercase transition-colors duration-500 hover:border-foreground/70 disabled:opacity-40"
      >
        {pending ? strings.signingIn : strings.signIn}
      </button>
    </form>
  );
}
