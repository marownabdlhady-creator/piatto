import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MenuScreen, type MenuGroup } from "@/components/menu-screen";
import { SiteNav } from "@/components/site-nav";
import { SocialLinks } from "@/components/social-links";
import { getDrinksMenu, getFoodMenu } from "@/lib/menu";

/**
 * Rendered once and refreshed in the background a minute later, so a phone on
 * the street gets a static page and an edited dish still shows up shortly
 * after. Has to be a literal here; it mirrors MENU_REVALIDATE_SECONDS.
 */
export const revalidate = 60;

/**
 * The ids the two dividers carry, and so the hashes /menu can be deep-linked
 * at: `/menu#drinks` lands the reader on the Drinks divider rather than at the
 * top of the food.
 */
const FOOD_ANCHOR = "food";
const DRINKS_ANCHOR = "drinks";

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

/**
 * The whole menu, read from the database: the food, then the drinks, each
 * behind its own divider. Both are cached under their own tag, so an edit to
 * either in the dashboard drops this page.
 */
export default async function Menu({ params }: MenuProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("features");
  const tPage = await getTranslations("menuPage");

  const [food, drinks] = await Promise.all([
    getFoodMenu(locale),
    getDrinksMenu(locale),
  ]);

  const groups: MenuGroup[] = [
    { id: FOOD_ANCHOR, label: tPage("food"), menu: food },
    { id: DRINKS_ANCHOR, label: tPage("drinks"), menu: drinks },
  ];

  return (
    <>
      <SiteNav />
      <main>
        <MenuScreen
          title={t("menu")}
          image="/feature-menu.jpg"
          groups={groups}
          sectionsLabel={tPage("sections")}
        />

        {/* Where to find the restaurant between visits, at the end of the
            read. The menu screen already closes on its own bottom margin, so
            this only carries the space below itself. */}
        <div className="px-4 pb-24 sm:px-6 md:px-8 md:pb-32 lg:px-12">
          <SocialLinks className="justify-center" />
        </div>
      </main>
    </>
  );
}
