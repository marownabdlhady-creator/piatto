/**
 * Puts the photographs that ship in public/ into the GalleryImage table, in the
 * order /gallery has always run them in.
 *
 *   npm run db:seed:gallery
 *
 * Re-runnable: it replaces its own twelve rows and leaves every other row
 * alone, so once the dashboard can upload, running this again restores the
 * bundled set without touching anything added since.
 *
 * These rows keep pointing at the files in public/ rather than moving to Blob:
 * they ship with the app, so they cost nothing to serve and cannot go missing.
 * Uploads from the dashboard are what Blob is for.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * The set, in display order. The sizes are the ones the page has always
 * declared — next/image reserves each box from the ratio, so they are what
 * keeps the masonry's rhythm exactly as it is.
 *
 * No alt text: these twelve are described in both languages under
 * "galleryPage.alt" in the message files, and the column holds one string.
 */
const BUNDLED = [
  { url: "/gallery-1.jpg", width: 1200, height: 1500 },
  { url: "/gallery-2.jpg", width: 1200, height: 900 },
  { url: "/gallery-3.jpg", width: 1200, height: 800 },
  { url: "/gallery-4.jpg", width: 1200, height: 1200 },
  { url: "/gallery-5.jpg", width: 1200, height: 1500 },
  { url: "/gallery-6.jpg", width: 1200, height: 800 },
  { url: "/gallery-7.jpg", width: 1200, height: 1500 },
  { url: "/gallery-8.jpg", width: 1200, height: 1200 },
  { url: "/gallery-9.jpg", width: 1200, height: 900 },
  { url: "/gallery-10.jpg", width: 1200, height: 800 },
  { url: "/gallery-11.jpg", width: 1200, height: 1200 },
  { url: "/gallery-12.jpg", width: 1200, height: 1500 },
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const urls = BUNDLED.map((image) => image.url);

    await prisma.$transaction([
      prisma.galleryImage.deleteMany({ where: { url: { in: urls } } }),
      prisma.galleryImage.createMany({
        data: BUNDLED.map((image, index) => ({ ...image, order: index })),
      }),
    ]);

    const total = await prisma.galleryImage.count();
    console.log(`Gallery: ${BUNDLED.length} bundled images, ${total} in total.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
