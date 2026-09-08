import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageTitle } from "@/components/page-title";

type ReservationsProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route for the reservation action; the booking flow comes later. */
export default async function Reservations({ params }: ReservationsProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("reservations");

  return <PageTitle>{t("title")}</PageTitle>;
}
