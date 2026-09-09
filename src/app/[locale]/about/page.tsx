import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteNav } from "@/components/site-nav";
import { Story } from "@/components/story";

type AboutProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AboutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });

  return { title: `${t("heading")} — piatto` };
}

/** The full story, linked from the home page teaser and the Features panel. */
export default async function About({ params }: AboutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <SiteNav />
      <main>
        <Story />
      </main>
    </>
  );
}
