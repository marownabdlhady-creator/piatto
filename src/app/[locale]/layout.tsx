import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer";
import { fontVariables } from "@/lib/fonts";
import { localeDirections, routing } from "@/i18n/routing";

import "../globals.css";

export const metadata: Metadata = {
  title: "piatto",
  description: "piatto — fine dining.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={localeDirections[locale]}
      className={`${fontVariables} h-full`}
    >
      <body className="min-h-full">
        <NextIntlClientProvider>
          {children}
          {/* Closes out every route, so no page has to carry it. */}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
