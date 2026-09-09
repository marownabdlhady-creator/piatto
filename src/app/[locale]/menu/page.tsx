import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MenuScreen } from "@/components/menu-screen";
import { SiteNav } from "@/components/site-nav";
import { getMenuDocument } from "@/lib/menu-data";

type MenuProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MenuProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "features" });

  return { title: `${t("menu")} — piatto` };
}

/** The food menu, read from menu.json. */
export default async function Menu({ params }: MenuProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("features");
  const tPage = await getTranslations("menuPage");

  return (
    <>
      <SiteNav />
      <main>
        <MenuScreen
          title={t("menu")}
          image="/feature-menu.jpg"
          menu={getMenuDocument("menu", locale)}
          sectionsLabel={tPage("sections")}
          crossLink={{ href: "/drinks", label: tPage("viewDrinks") }}
        />
      </main>
    </>
  );
}
