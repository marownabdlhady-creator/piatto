import type { Metadata } from "next";

import { AdminLanguageProvider } from "@/components/admin/language";
import { adminDir } from "@/lib/admin/i18n";
import { readAdminLocale } from "@/lib/admin/locale";
import { fontVariables } from "@/lib/fonts";

import "../globals.css";

/**
 * The dashboard's own root layout. /admin sits beside the public [locale]
 * tree rather than inside it, so it has no locale, no site nav or footer, and
 * none of the bilingual routing.
 *
 * It does have an interface language of its own, chosen with the toggle in the
 * header and remembered in a cookie. That is read here so `lang` and `dir` are
 * correct in the first byte of the response — and, because `lang` is what the
 * stylesheet keys the Arabic face and the letter-spacing rules off, so the
 * whole dashboard follows without a second set of rules.
 */

export const metadata: Metadata = {
  title: "piatto — admin",
  // Nothing here should ever turn up in a search result.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await readAdminLocale();

  return (
    <html
      lang={locale}
      dir={adminDir(locale)}
      className={`${fontVariables} h-full`}
    >
      <body className="min-h-full">
        <AdminLanguageProvider locale={locale}>{children}</AdminLanguageProvider>
      </body>
    </html>
  );
}
