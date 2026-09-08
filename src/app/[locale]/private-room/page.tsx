import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageTitle } from "@/components/page-title";

type PrivateRoomProps = {
  params: Promise<{ locale: string }>;
};

/** Placeholder route linked from the Spaces section. */
export default async function PrivateRoom({ params }: PrivateRoomProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("spaces");

  return <PageTitle>{t("privateRoom")}</PageTitle>;
}
