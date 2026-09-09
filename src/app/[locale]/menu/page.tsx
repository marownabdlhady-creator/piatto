import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageTitle } from "@/components/page-title";

type MenuProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route linked from the Features section. */
export default async function Menu({ params }: MenuProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("features");

  return <PageTitle>{t("menu")}</PageTitle>;
}
