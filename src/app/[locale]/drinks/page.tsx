import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MenuScreen } from "@/components/menu-screen";
import { SiteNav } from "@/components/site-nav";
import { getDrinksMenu } from "@/lib/menu";

/**
 * Rendered once and refreshed in the background a minute later, so a phone on
 * the street gets a static page and an edited dish still shows up shortly
 * after. Has to be a literal here; it mirrors MENU_REVALIDATE_SECONDS.
 */
export const revalidate = 60;

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

/** The drinks list, read from the database. */
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
          menu={await getDrinksMenu(locale)}
          sectionsLabel={tPage("sections")}
          crossLink={{ href: "/menu", label: tPage("viewMenu") }}
        />
      </main>
    </>
  );
}
