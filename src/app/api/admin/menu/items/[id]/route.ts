import { NextResponse } from "next/server";

import { fail, handle, readJson, unauthorized } from "@/lib/admin/api";
import { firstIssue, itemInput } from "@/lib/admin/item-input";
import { contentColumns, optionRows } from "@/lib/admin/item-columns";
import { domainOfItem, revalidateMenu } from "@/lib/admin/menu";
import { prisma } from "@/lib/prisma";

/**
 * One item: save it, or remove it. Both are scoped to the id in the path, so
 * nothing an edit does can reach another row.
 */

/** Saves an item's names, descriptions, pricing and visibility. */
export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/menu/items/[id]">,
) {
  return handle("PATCH /api/admin/menu/items/[id]", async () => {
    const denied = await unauthorized();
    if (denied) return denied;

    const { id } = await context.params;

    const read = await readJson(request);
    if ("response" in read) return read.response;

    const parsed = itemInput.safeParse(read.body);
    if (!parsed.success) {
      return fail(firstIssue(parsed.error), 400);
    }

    const input = parsed.data;

    const domain = await domainOfItem(id);
    if (!domain) {
      return fail("That item no longer exists.", 404);
    }

    // The options are replaced wholesale rather than reconciled row by row: the
    // editor hands over the list it wants, and the two writes have to land
    // together or an item is briefly left with the wrong prices.
    await prisma.$transaction(async (tx) => {
      await tx.item.update({
        where: { id },
        data: contentColumns(input),
      });

      await tx.priceOption.deleteMany({ where: { itemId: id } });

      const options = optionRows(input);
      if (options.length > 0) {
        await tx.priceOption.createMany({
          data: options.map((option) => ({ ...option, itemId: id })),
        });
      }
    });

    revalidateMenu(domain);

    return NextResponse.json({ ok: true });
  });
}

/** Deletes an item. Its price options go with it, by cascade. */
export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/menu/items/[id]">,
) {
  return handle("DELETE /api/admin/menu/items/[id]", async () => {
    const denied = await unauthorized();
    if (denied) return denied;

    const { id } = await context.params;

    const domain = await domainOfItem(id);
    if (!domain) {
      // Already gone. Say so rather than pretending, so the editor can explain
      // why the row it was looking at is not there any more.
      return fail("That item no longer exists.", 404);
    }

    await prisma.item.delete({ where: { id } });

    revalidateMenu(domain);

    return NextResponse.json({ ok: true });
  });
}
