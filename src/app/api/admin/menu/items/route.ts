import { NextResponse } from "next/server";

import { fail, readJson, unauthorized } from "@/lib/admin/api";
import { createItemInput, firstIssue } from "@/lib/admin/item-input";
import {
  contentColumns,
  optionRows,
  revalidateMenu,
} from "@/lib/admin/menu";
import { prisma } from "@/lib/prisma";

/**
 * Adds an item to a section.
 *
 * The section is looked up rather than taken on trust: it fixes the domain to
 * revalidate, and it means a made-up id gets a 404 instead of a foreign key
 * error from the database.
 */
export async function POST(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;

  const read = await readJson(request);
  if ("response" in read) return read.response;

  const parsed = createItemInput.safeParse(read.body);
  if (!parsed.success) {
    return fail(firstIssue(parsed.error), 400);
  }

  const { sectionId, item } = parsed.data;

  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { domain: true },
  });

  if (!section) {
    return fail("That section no longer exists.", 404);
  }

  // One transaction, because the item and its options are a single thing: an
  // OPTIONS item that landed without its options would be a priceless row on
  // the public menu.
  const created = await prisma.$transaction(async (tx) => {
    const last = await tx.item.aggregate({
      where: { sectionId },
      _max: { order: true },
    });

    return tx.item.create({
      data: {
        sectionId,
        ...contentColumns(item),
        // Appended to the end of the section; ordering is not editable yet.
        order: (last._max.order ?? -1) + 1,
        priceOptions: { create: optionRows(item) },
      },
      select: { id: true },
    });
  });

  revalidateMenu(section.domain);

  return NextResponse.json({ id: created.id }, { status: 201 });
}
