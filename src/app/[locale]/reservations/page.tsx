import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Reservation } from "@/components/reservation";
import { SiteNav } from "@/components/site-nav";

type ReservationsProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ReservationsProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservations" });

  return { title: `${t("title")} — piatto` };
}

/** Booking a table, which is done over WhatsApp rather than through us. */
export default async function Reservations({ params }: ReservationsProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteNav />

      <main className="bg-background text-foreground">
        <Reservation />

        {/* Run-out: keeps the form clear of the footer below. */}
        <div className="h-24 md:h-32" />
      </main>
    </>
  );
}
