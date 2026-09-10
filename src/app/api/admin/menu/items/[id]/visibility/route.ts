import { NextResponse } from "next/server";

import { fail, readJson, unauthorized } from "@/lib/admin/api";
import { firstIssue, visibilityInput } from "@/lib/admin/item-input";
import { domainOfItem, revalidateMenu } from "@/lib/admin/menu";
import { prisma } from "@/lib/prisma";

/**
 * Takes an item off the public menu, or puts it back.
 *
 * Its own route rather than a PATCH of the whole item, because the toggle on a
 * row has only the one field to send — it should not have to round-trip an
 * item's names and prices to say a dish is off today.
 */
export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/menu/items/[id]/visibility">,
) {
  const denied = await unauthorized();
  if (denied) return denied;

  const { id } = await context.params;

  const read = await readJson(request);
  if ("response" in read) return read.response;

  const parsed = visibilityInput.safeParse(read.body);
  if (!parsed.success) {
    return fail(firstIssue(parsed.error), 400);
  }

  const domain = await domainOfItem(id);
  if (!domain) {
    return fail("That item no longer exists.", 404);
  }

  await prisma.item.update({
    where: { id },
    data: { hidden: parsed.data.hidden },
  });

  revalidateMenu(domain);

  return NextResponse.json({ hidden: parsed.data.hidden });
}
