import { z } from "zod";

/**
 * The shape of an item as the dashboard submits it, and the only definition of
 * what counts as valid.
 *
 * This file is deliberately free of `server-only` and of Prisma: the editor
 * imports it in the browser to check a form before it is sent, and the API
 * routes import it to check the same payload again on arrival. One schema, so
 * the two can never drift apart — but the browser copy is a convenience, and
 * the server never assumes it ran.
 */

/** The three pricing shapes, mirroring the `PriceType` enum in the schema. */
export const PRICE_TYPES = ["SIMPLE", "OPTIONS", "TEXT"] as const;

export type PriceTypeValue = (typeof PRICE_TYPES)[number];

const NAME_MAX = 120;
const DESCRIPTION_MAX = 600;
const LABEL_MAX = 60;
const PRICE_TEXT_MAX = 60;

/** Prices are whole shekels. The ceiling only exists to catch a slipped key. */
const PRICE_MAX = 100_000;

/** Enough for any real dish; a runaway list is a mistake, not a menu. */
const OPTIONS_MAX = 20;

function requiredText(field: string, max: number) {
  return z
    .string({ error: `${field} is required.` })
    .trim()
    .min(1, `${field} is required.`)
    .max(max, `${field} must be ${max} characters or fewer.`);
}

/** A description or note: blank is fine, and blank is stored as nothing. */
function optionalText(field: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${field} must be ${max} characters or fewer.`)
    .optional()
    .transform((value) => value || null);
}

function wholePrice(field: string) {
  return z
    .number({ error: `${field} must be a number.` })
    .int(`${field} must be a whole number.`)
    .min(0, `${field} cannot be negative.`)
    .max(PRICE_MAX, `${field} is implausibly large.`);
}

const priceOptionInput = z.object({
  labelEn: requiredText("Option label (EN)", LABEL_MAX),
  labelAr: requiredText("Option label (AR)", LABEL_MAX),
  price: wholePrice("Option price"),
});

export type PriceOptionInput = z.infer<typeof priceOptionInput>;

/**
 * The fields every item has, whatever its pricing. Spread into each arm of the
 * union below so the discriminant stays at the top level, which is what makes
 * the error for a bad price point at the price rather than at the whole item.
 */
const commonFields = {
  nameEn: requiredText("Name (EN)", NAME_MAX),
  nameAr: requiredText("Name (AR)", NAME_MAX),
  descEn: optionalText("Description (EN)", DESCRIPTION_MAX),
  descAr: optionalText("Description (AR)", DESCRIPTION_MAX),
  hidden: z.boolean(),
};

/**
 * An item's editable content. The pricing arms are exclusive: an item carries
 * exactly one of a number, a list of options, or a written-out string, and the
 * other two columns are cleared when it is saved.
 *
 * The `min(1)` on the options list is the rule that matters most here — an
 * OPTIONS item with nothing to choose between renders on the public page as a
 * name with no price at all, so it must never reach the table.
 */
export const itemInput = z.discriminatedUnion("priceType", [
  z.object({
    ...commonFields,
    priceType: z.literal("SIMPLE"),
    priceValue: wholePrice("Price"),
  }),
  z.object({
    ...commonFields,
    priceType: z.literal("OPTIONS"),
    priceOptions: z
      .array(priceOptionInput)
      .min(1, "An options item needs at least one option.")
      .max(OPTIONS_MAX, `An item can have at most ${OPTIONS_MAX} options.`),
  }),
  z.object({
    ...commonFields,
    priceType: z.literal("TEXT"),
    priceText: requiredText("Price text", PRICE_TEXT_MAX),
  }),
]);

export type ItemInput = z.infer<typeof itemInput>;

/** A new item, which also has to say where it goes. */
export const createItemInput = z.object({
  sectionId: z.string().trim().min(1, "A section is required."),
  item: itemInput,
});

/** The quick toggle on a row, which changes nothing else about the item. */
export const visibilityInput = z.object({
  hidden: z.boolean({ error: "Expected a true or false visibility." }),
});

/**
 * The first thing wrong with a payload, phrased for a person. Zod reports
 * every issue, but the editor shows one line, and the first is the one a
 * reader would fix first.
 */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "That does not look right.";

  // Messages written above already name their field; Zod's own fallbacks do
  // not, so those get the path prepended.
  const path = issue.path.join(".");
  return path && /^(Invalid|Expected|Too|Unrecognized)/.test(issue.message)
    ? `${path}: ${issue.message}`
    : issue.message;
}
