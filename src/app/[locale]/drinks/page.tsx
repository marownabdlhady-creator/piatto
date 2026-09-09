import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageTitle } from "@/components/page-title";

type DrinksProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route linked from the Features section. */
export default async function Drinks({ params }: DrinksProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("features");

  return <PageTitle>{t("drinks")}</PageTitle>;
}
