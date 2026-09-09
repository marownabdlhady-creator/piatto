import drinksFile from "../../drinks.json";
import menuFile from "../../menu.json";
import { defaultLocale } from "@/i18n/routing";

export type PriceOption = {
  label: string;
  price: number;
};

/**
 * One dish or drink. Exactly one of the three pricing shapes is present: a
 * single `price`, a set of `priceOptions`, or a `priceText` that is already
 * written out ("35 / 40").
 */
export type MenuItem = {
  name: string;
  description?: string;
  price?: number;
  priceOptions?: PriceOption[];
  priceText?: string;
};

export type MenuSection = {
  id: string;
  title: string;
  note?: string;
  items: MenuItem[];
};

export type MenuDocument = {
  currency: string;
  note?: string;
  sections: MenuSection[];
};

/**
 * The menus live as JSON at the repo root, one document per locale, so prices
 * and dishes can be edited without touching the components. They are imported
 * rather than read at runtime, so the pages stay static.
 */
const documents = {
  menu: menuFile as Record<string, MenuDocument>,
  drinks: drinksFile as Record<string, MenuDocument>,
};

export type MenuKind = keyof typeof documents;

/** The requested menu, falling back to the default locale if one is missing. */
export function getMenuDocument(kind: MenuKind, locale: string): MenuDocument {
  const byLocale = documents[kind];
  return byLocale[locale] ?? byLocale[defaultLocale];
}

/** A price as it is written on the page: the amount, then the currency. */
export function formatPrice(value: number | string, currency: string): string {
  return `${value} ${currency}`;
}
