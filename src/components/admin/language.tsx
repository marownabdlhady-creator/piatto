"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  ADMIN_LOCALE_COOKIE,
  ADMIN_LOCALE_MAX_AGE,
  ADMIN_LOCALE_NAMES,
  ADMIN_LOCALES,
  adminDir,
  adminStrings,
  DEFAULT_ADMIN_LOCALE,
  type AdminLocale,
  type AdminStrings,
} from "@/lib/admin/i18n";

/**
 * Carries the dashboard's interface language to every client component under
 * it, so nothing has to thread a `strings` prop through four levels of list.
 *
 * The language itself is decided on the server, from a cookie, and arrives as
 * a prop — which is what keeps the first paint in the right language and the
 * right direction instead of flipping once the browser catches up.
 */

type AdminLanguage = {
  locale: AdminLocale;
  strings: AdminStrings;
};

const AdminLanguageContext = createContext<AdminLanguage>({
  locale: DEFAULT_ADMIN_LOCALE,
  strings: adminStrings(DEFAULT_ADMIN_LOCALE),
});

export function AdminLanguageProvider({
  locale,
  children,
}: {
  locale: AdminLocale;
  children: React.ReactNode;
}) {
  return (
    <AdminLanguageContext
      value={{ locale, strings: adminStrings(locale) }}
    >
      {children}
    </AdminLanguageContext>
  );
}

/** The dashboard's strings, for anything drawing part of the interface. */
export function useAdminStrings(): AdminStrings {
  return useContext(AdminLanguageContext).strings;
}

export function useAdminLocale(): AdminLocale {
  return useContext(AdminLanguageContext).locale;
}

/**
 * Switches the interface between English and Arabic.
 *
 * The cookie is what persists the choice and what the layout reads on the next
 * request; the two lines that write to `documentElement` are only so the flip
 * is instant rather than waiting on the round trip. The refresh then re-renders
 * the tree — including the server components — in the new language.
 */
export function AdminLanguageToggle() {
  const router = useRouter();
  const { locale, strings } = useContext(AdminLanguageContext);
  const [pending, startTransition] = useTransition();
  /** The language just picked, until the server has been told about it. */
  const [chosen, setChosen] = useState<AdminLocale | null>(null);

  // Writing the cookie and flipping <html> are both changes to the document
  // rather than to this component, so they belong in an effect: the click only
  // records what was picked.
  useEffect(() => {
    if (chosen === null) return;

    document.cookie = [
      `${ADMIN_LOCALE_COOKIE}=${chosen}`,
      // Scoped to the dashboard, so it never rides along with a request for
      // the public site.
      "path=/admin",
      `max-age=${ADMIN_LOCALE_MAX_AGE}`,
      "samesite=lax",
    ].join("; ");

    // The refresh below re-renders the layout with the new language, but these
    // two land immediately, so the flip does not wait on the round trip.
    document.documentElement.lang = chosen;
    document.documentElement.dir = adminDir(chosen);

    startTransition(() => router.refresh());
  }, [chosen, router]);

  function choose(next: AdminLocale) {
    if (next === locale || pending) return;
    setChosen(next);
  }

  return (
    <div
      role="group"
      aria-label={strings.language}
      className="flex items-center gap-1"
    >
      {ADMIN_LOCALES.map((candidate) => {
        const active = candidate === locale;

        return (
          <button
            key={candidate}
            type="button"
            lang={candidate}
            onClick={() => choose(candidate)}
            aria-pressed={active}
            className={`tracked-label rounded-[2px] border px-3 py-2 text-[0.62rem] tracking-[0.16em] uppercase transition-colors duration-200 ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 hover:border-foreground/60"
            }`}
          >
            {ADMIN_LOCALE_NAMES[candidate]}
          </button>
        );
      })}
    </div>
  );
}
