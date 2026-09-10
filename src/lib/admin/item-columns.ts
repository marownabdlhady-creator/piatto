import type { ItemInput } from "@/lib/admin/item-input";

/**
 * Validated input turned into the columns an item is stored in.
 *
 * Pure mapping, and deliberately not `server-only`: these are the functions
 * that decide what a save actually writes, so being able to import them
 * outside a request — from a script checking the three pricing shapes, say —
 * is worth more than the marginal safety of sealing them into the server.
 * They touch neither Prisma nor the connection.
 */

/**
 * The three pricing columns. Every save sets all three, so the two that do not
 * apply are cleared rather than left over from a previous shape — an item
 * switched from SIMPLE to TEXT must not keep its old number around.
 */
function pricingColumns(input: ItemInput) {
  return {
    priceType: input.priceType,
    priceValue: input.priceType === "SIMPLE" ? input.priceValue : null,
    priceText: input.priceType === "TEXT" ? input.priceText : null,
  };
}

/** An item's option rows, in the order the editor listed them. */
export function optionRows(input: ItemInput) {
  return input.priceType === "OPTIONS"
    ? input.priceOptions.map((option, index) => ({
        labelEn: option.labelEn,
        labelAr: option.labelAr,
        price: option.price,
        order: index,
      }))
    : [];
}

/** The content columns shared by a create and an update. */
export function contentColumns(input: ItemInput) {
  return {
    nameEn: input.nameEn,
    nameAr: input.nameAr,
    descEn: input.descEn,
    descAr: input.descAr,
    hidden: input.hidden,
    ...pricingColumns(input),
  };
}
