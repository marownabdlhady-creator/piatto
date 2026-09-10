import type { Metadata } from "next";

import { fontVariables } from "@/lib/fonts";

import "../globals.css";

/**
 * The dashboard's own root layout. /admin sits beside the public [locale]
 * tree rather than inside it, so it has no locale, no site nav or footer, and
 * none of the bilingual routing — it is English-only and for one person.
 */

export const metadata: Metadata = {
  title: "piatto — admin",
  // Nothing here should ever turn up in a search result.
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
