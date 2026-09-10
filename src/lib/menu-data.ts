/**
 * The shape a menu takes on the page, in one language.
 *
 * This is deliberately free of any data source: the menus live in Postgres and
 * are read by `@/lib/menu`, which returns these shapes. Keeping the two apart
 * lets the components stay unaware of where a dish came from.
 */

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

/** A price as it is written on the page: the amount, then the currency. */
export function formatPrice(value: number | string, currency: string): string {
  return `${value} ${currency}`;
}
