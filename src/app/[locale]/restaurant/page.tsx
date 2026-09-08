import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageTitle } from "@/components/page-title";

type RestaurantProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route linked from the Spaces section. */
export default async function Restaurant({ params }: RestaurantProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("spaces");

  return <PageTitle>{t("restaurant")}</PageTitle>;
}
