import type { PriceTypeValue } from "@/lib/admin/item-input";

/**
 * The shape the dashboard hands to the browser.
 *
 * Kept apart from `@/lib/admin/menu` — which is server-only and imports Prisma
 * — so the editor can import these types and the tab labels without dragging a
 * database client into the client bundle.
 */

/** Both menus, in the order the tabs show them. Mirrors the `MenuDomain` enum. */
export const DOMAINS = ["FOOD", "DRINKS"] as const;

export type Domain = (typeof DOMAINS)[number];

export const DOMAIN_LABELS: Record<Domain, string> = {
  FOOD: "Food",
  DRINKS: "Drinks",
};

/** Whether a string is one of the two domains, for values off the wire. */
export function isDomain(value: string): value is Domain {
  return (DOMAINS as readonly string[]).includes(value);
}

export type EditorPriceOption = {
  id: string;
  labelEn: string;
  labelAr: string;
  price: number;
};

export type EditorItem = {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string | null;
  descAr: string | null;
  priceType: PriceTypeValue;
  priceValue: number | null;
  priceText: string | null;
  priceOptions: EditorPriceOption[];
  hidden: boolean;
};

export type EditorSection = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  items: EditorItem[];
};

export type EditorMenu = {
  domain: Domain;
  currency: string;
  sections: EditorSection[];
};
