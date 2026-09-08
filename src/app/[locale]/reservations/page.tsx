import { getTranslations, setRequestLocale } from "next-intl/server";

type ReservationsProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route for the top-bar action; the booking flow comes later. */
export default async function Reservations({ params }: ReservationsProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("reservations");

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <h1 className="text-[1.6rem] tracking-[0.16em] md:text-[2rem]">
        {t("title")}
      </h1>
    </main>
  );
}
