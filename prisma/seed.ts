import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { MenuDomain, PriceType, PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** The shape of menu.json and drinks.json, one document per locale. */
type SourceOption = { label: string; price: number };

type SourceItem = {
  name: string;
  description?: string;
  price?: number;
  priceOptions?: SourceOption[];
  priceText?: string;
};

type SourceSection = {
  id: string;
  title: string;
  note?: string;
  items: SourceItem[];
};

type SourceDocument = {
  currency: string;
  note?: string;
  sections: SourceSection[];
};

type SourceFile = Record<"en" | "ar", SourceDocument>;

/** The JSON files sit at the repo root, where the seed is run from. */
const projectRoot = process.cwd();

async function readSource(fileName: string): Promise<SourceFile> {
  const raw = await readFile(path.join(projectRoot, fileName), "utf8");
  return JSON.parse(raw) as SourceFile;
}

/**
 * The English and Arabic documents are parallel — the same sections holding the
 * same items in the same order — so the two are merged by position, and any
 * drift between them is a bug in the source worth stopping for.
 */
function pairUp<T>(en: T[], ar: T[], what: string): [T, T][] {
  if (en.length !== ar.length) {
    throw new Error(
      `${what}: en has ${en.length} entries but ar has ${ar.length}`,
    );
  }
  return en.map((entry, index) => [entry, ar[index]]);
}

/** The pricing shape an item carries, mapped onto the columns that hold it. */
function pricingOf(item: SourceItem, where: string) {
  if (typeof item.price === "number") {
    return {
      priceType: PriceType.SIMPLE,
      priceValue: item.price,
      priceText: null,
    };
  }
  if (item.priceOptions) {
    return { priceType: PriceType.OPTIONS, priceValue: null, priceText: null };
  }
  if (item.priceText) {
    return {
      priceType: PriceType.TEXT,
      priceValue: null,
      priceText: item.priceText,
    };
  }
  throw new Error(
    `${where}: "${item.name}" has no price, priceOptions or priceText`,
  );
}

async function seedDomain(domain: MenuDomain, fileName: string) {
  const source = await readSource(fileName);
  const { en, ar } = source;

  await prisma.menuMeta.create({
    data: {
      domain,
      currency: en.currency,
      noteEn: en.note ?? null,
      noteAr: ar.note ?? null,
    },
  });

  const sections = pairUp(en.sections, ar.sections, `${fileName} sections`);

  for (const [sectionIndex, [sectionEn, sectionAr]] of sections.entries()) {
    if (sectionEn.id !== sectionAr.id) {
      throw new Error(
        `${fileName}: section ${sectionIndex} is "${sectionEn.id}" in en but "${sectionAr.id}" in ar`,
      );
    }

    const section = await prisma.section.create({
      data: {
        domain,
        slug: sectionEn.id,
        titleEn: sectionEn.title,
        titleAr: sectionAr.title,
        noteEn: sectionEn.note ?? null,
        noteAr: sectionAr.note ?? null,
        order: sectionIndex,
      },
    });

    const items = pairUp(
      sectionEn.items,
      sectionAr.items,
      `${fileName} ${sectionEn.id} items`,
    );

    for (const [itemIndex, [itemEn, itemAr]] of items.entries()) {
      const where = `${fileName} ${sectionEn.id}`;
      const pricing = pricingOf(itemEn, where);

      const options =
        itemEn.priceOptions && itemAr.priceOptions
          ? pairUp(
              itemEn.priceOptions,
              itemAr.priceOptions,
              `${where} "${itemEn.name}" priceOptions`,
            )
          : [];

      await prisma.item.create({
        data: {
          sectionId: section.id,
          nameEn: itemEn.name,
          nameAr: itemAr.name,
          descEn: itemEn.description ?? null,
          descAr: itemAr.description ?? null,
          order: itemIndex,
          ...pricing,
          priceOptions: {
            create: options.map(([optionEn, optionAr], optionIndex) => ({
              labelEn: optionEn.label,
              labelAr: optionAr.label,
              price: optionEn.price,
              order: optionIndex,
            })),
          },
        },
      });
    }
  }

  const sectionCount = await prisma.section.count({ where: { domain } });
  const itemCount = await prisma.item.count({ where: { section: { domain } } });
  console.log(`${domain}: ${sectionCount} sections, ${itemCount} items`);
}

/**
 * Reset then insert: the JSON files are the source of truth at this stage, so
 * the seed wipes the menu tables and rebuilds them, and can be re-run freely.
 */
async function main() {
  await prisma.priceOption.deleteMany();
  await prisma.item.deleteMany();
  await prisma.section.deleteMany();
  await prisma.menuMeta.deleteMany();

  await seedDomain(MenuDomain.FOOD, "menu.json");
  await seedDomain(MenuDomain.DRINKS, "drinks.json");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
