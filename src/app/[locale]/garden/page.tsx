import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageTitle } from "@/components/page-title";

type GardenProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route linked from the Spaces section. */
export default async function Garden({ params }: GardenProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("spaces");

  return <PageTitle>{t("garden")}</PageTitle>;
}
