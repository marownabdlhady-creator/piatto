import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageTitle } from "@/components/page-title";

type AboutProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route linked from the Features section. */
export default async function About({ params }: AboutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("features");

  return <PageTitle>{t("about")}</PageTitle>;
}
