import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MenuScreen } from "@/components/menu-screen";
import { SiteNav } from "@/components/site-nav";
import { getMenuDocument } from "@/lib/menu-data";

type DrinksProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: DrinksProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "features" });

  return { title: `${t("drinks")} — piatto` };
}

/** The drinks list, read from drinks.json. */
export default async function Drinks({ params }: DrinksProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("features");
  const tPage = await getTranslations("menuPage");

  return (
    <>
      <SiteNav />
      <main>
        <MenuScreen
          title={t("drinks")}
          image="/feature-drinks.jpg"
          menu={getMenuDocument("drinks", locale)}
          sectionsLabel={tPage("sections")}
          crossLink={{ href: "/menu", label: tPage("viewMenu") }}
        />
      </main>
    </>
  );
}
