import { unstable_cache } from "next/cache";
import { hasLocale } from "next-intl";

import { MenuDomain, PriceType } from "@prisma/client";
import type {
  Item,
  PriceOption as PriceOptionRow,
  Section,
} from "@prisma/client";

import { defaultLocale, locales, type Locale } from "@/i18n/routing";
import type {
  MenuDocument,
  MenuItem,
  MenuSection,
  PriceOption,
} from "@/lib/menu-data";
import { prisma } from "@/lib/prisma";

/**
 * Cache tags, one per menu. Both languages of a menu carry its tag, so a save
 * in the dashboard can drop the English and Arabic pages together with a
 * single `revalidateTag(MENU_TAGS.food, "max")`.
 */
export const MENU_TAGS = {
  food: "menu-food",
  drinks: "menu-drinks",
} as const;

/**
 * How long a rendered menu may be served before it is refreshed in the
 * background. The pages repeat this as their route `revalidate`, which has to
 * be a literal there, so the two are kept in step by hand.
 */
export const MENU_REVALIDATE_SECONDS = 60;

/** Shown if a menu somehow has no row of its own settings. */
const FALLBACK_CURRENCY = "₪";

/** A section with everything the page draws, already in display order. */
type SectionRow = Section & {
  items: (Item & { priceOptions: PriceOptionRow[] })[];
};

/** The two locales the site is written in, as stored on every row. */
function languageOf(locale: string): Locale {
  return hasLocale(locales, locale) ? locale : defaultLocale;
}

/**
 * A field written in both languages. Names and titles have to say something,
 * so an empty one falls back to the other language rather than leaving a hole
 * on the page.
 */
function required(en: string, ar: string, language: Locale): string {
  return language === "ar" ? ar || en : en || ar;
}

/** A field that is often absent — a description, a note. */
function optional(
  en: string | null,
  ar: string | null,
  language: Locale,
): string | undefined {
  return (language === "ar" ? ar : en) ?? undefined;
}

/**
 * The pricing columns turned back into one of the three shapes the page knows.
 * Each returns only its own key, so the other two stay `undefined` and the row
 * picks the right branch.
 */
function pricingOf(
  item: Item & { priceOptions: PriceOptionRow[] },
  language: Locale,
): Pick<MenuItem, "price" | "priceOptions" | "priceText"> {
  switch (item.priceType) {
    case PriceType.OPTIONS: {
      // An options item with nothing to choose between would render as a name
      // with no price at all, so it falls through to the plain shape instead.
      if (item.priceOptions.length === 0) return {};

      const options: PriceOption[] = item.priceOptions.map((option) => ({
        label: required(option.labelEn, option.labelAr, language),
        price: option.price,
      }));

      return { priceOptions: options };
    }

    case PriceType.TEXT:
      return { priceText: item.priceText ?? undefined };

    case PriceType.SIMPLE:
    default:
      return { price: item.priceValue ?? undefined };
  }
}

function toItem(
  item: Item & { priceOptions: PriceOptionRow[] },
  language: Locale,
): MenuItem {
  return {
    name: required(item.nameEn, item.nameAr, language),
    description: optional(item.descEn, item.descAr, language),
    ...pricingOf(item, language),
  };
}

function toSection(section: SectionRow, language: Locale): MenuSection {
  return {
    // The slug is what the anchors and the category bar have always used.
    id: section.slug,
    title: required(section.titleEn, section.titleAr, language),
    note: optional(section.noteEn, section.noteAr, language),
    items: section.items.map((item) => toItem(item, language)),
  };
}

/**
 * One menu in one language. Sections and items come back in their stored
 * order, so the page reads exactly as it is arranged in the database.
 */
async function readMenu(
  domain: MenuDomain,
  locale: string,
): Promise<MenuDocument> {
  const language = languageOf(locale);

  const [meta, sections] = await Promise.all([
    prisma.menuMeta.findUnique({ where: { domain } }),
    prisma.section.findMany({
      where: { domain },
      orderBy: { order: "asc" },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: { priceOptions: { orderBy: { order: "asc" } } },
        },
      },
    }),
  ]);

  return {
    currency: meta?.currency ?? FALLBACK_CURRENCY,
    note: optional(meta?.noteEn ?? null, meta?.noteAr ?? null, language),
    sections: sections.map((section) => toSection(section, language)),
  };
}

/**
 * Wraps a menu read in the data cache under its own tag.
 *
 * `unstable_cache` is the pre-Cache-Components API and is on its way out; it is
 * what this app can use until `cacheComponents` is turned on, at which point
 * this becomes a `"use cache"` function with the same tag.
 */
function cachedMenu(domain: MenuDomain, tag: string) {
  return unstable_cache(
    (locale: string) => readMenu(domain, locale),
    ["menu", domain],
    { tags: [tag], revalidate: MENU_REVALIDATE_SECONDS },
  );
}

const loadFoodMenu = cachedMenu(MenuDomain.FOOD, MENU_TAGS.food);
const loadDrinksMenu = cachedMenu(MenuDomain.DRINKS, MENU_TAGS.drinks);

/** The food menu behind /menu. */
export function getFoodMenu(locale: string): Promise<MenuDocument> {
  return loadFoodMenu(locale);
}

/** The drinks list behind /drinks. */
export function getDrinksMenu(locale: string): Promise<MenuDocument> {
  return loadDrinksMenu(locale);
}
