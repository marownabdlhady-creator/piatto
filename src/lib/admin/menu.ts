import "server-only";

import { revalidateTag } from "next/cache";

import type { Prisma } from "@prisma/client";

import type { Domain, EditorMenu } from "@/lib/admin/menu-types";
import { MENU_TAGS } from "@/lib/menu";
import { prisma } from "@/lib/prisma";

/**
 * The dashboard's side of the menu: the same rows the public pages read, but
 * whole — hidden items included — and never cached, since the point of the
 * editor is to show what is in the table right now.
 *
 * Prisma is imported here and only here on the admin path. Everything below
 * runs on the server; the editor receives plain objects.
 */

/** Matches the fallback the public pages use when a menu has no meta row. */
const FALLBACK_CURRENCY = "₪";

/**
 * One menu as the editor lists it: every section in its stored order, every
 * item in its stored order, hidden or not.
 */
export async function readEditorMenu(domain: Domain): Promise<EditorMenu> {
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
    domain,
    currency: meta?.currency ?? FALLBACK_CURRENCY,
    sections: sections.map((section) => ({
      id: section.id,
      slug: section.slug,
      titleEn: section.titleEn,
      titleAr: section.titleAr,
      items: section.items.map((item) => ({
        id: item.id,
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        descEn: item.descEn,
        descAr: item.descAr,
        priceType: item.priceType,
        priceValue: item.priceValue,
        priceText: item.priceText,
        priceOptions: item.priceOptions.map((option) => ({
          id: option.id,
          labelEn: option.labelEn,
          labelAr: option.labelAr,
          price: option.price,
        })),
        hidden: item.hidden,
      })),
    })),
  };
}

/** The domain an existing item belongs to, or null if there is no such item. */
export async function domainOfItem(
  itemId: string,
  client: Prisma.TransactionClient = prisma,
): Promise<Domain | null> {
  const item = await client.item.findUnique({
    where: { id: itemId },
    select: { section: { select: { domain: true } } },
  });

  return item?.section.domain ?? null;
}

/**
 * Drops the cached menu behind a domain so the public page picks the change up
 * on its next request.
 *
 * `{ expire: 0 }` rather than `"max"`: this runs in a Route Handler, where
 * `updateTag` is not available, and stale-while-revalidate would show the
 * client their own edit one visit late. Expiring outright costs the first
 * visitor a render and makes the edit live straight away, which is the whole
 * point of the button they just pressed.
 */
export function revalidateMenu(domain: Domain): void {
  revalidateTag(domain === "FOOD" ? MENU_TAGS.food : MENU_TAGS.drinks, {
    expire: 0,
  });
}
