import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Gallery } from "@/components/gallery";
import { SiteNav } from "@/components/site-nav";
import { getGalleryPhotos } from "@/lib/gallery";

/**
 * Rendered once and refreshed in the background a minute later, so the page is
 * static for the reader while a photograph added in the dashboard still shows
 * up shortly after. Has to be a literal here; it mirrors
 * GALLERY_REVALIDATE_SECONDS.
 */
export const revalidate = 60;

type GalleryProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: GalleryProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galleryPage" });

  return { title: `${t("heading")} — piatto` };
}

/**
 * The photographs, read from the database in display order and cached under
 * the gallery's tag, so adding or removing one in the dashboard will drop this
 * page in both languages. The heading is rendered on the server so it paints
 * with the page; the masonry below it is a client component, since the stills
 * open into a panel of their own.
 */
export default async function GalleryPage({ params }: GalleryProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, photos] = await Promise.all([
    getTranslations("galleryPage"),
    getGalleryPhotos(locale),
  ]);

  return (
    <>
      <SiteNav />

      <main className="bg-background text-foreground">
        <header className="px-4 pt-20 pb-14 text-center sm:px-6 md:px-8 md:pt-28 md:pb-20 lg:px-12">
          <h1 className="display-tight text-[clamp(2.3rem,7.5vw,4.6rem)] leading-[1.12]">
            {t("heading")}
          </h1>

          <span
            aria-hidden="true"
            className="mx-auto mt-10 block h-px w-16 bg-foreground/25 md:mt-12"
          />

          <p className="mx-auto mt-10 max-w-[34rem] text-[0.86rem] leading-[1.9] text-pretty text-foreground/55 md:mt-12 md:text-[0.9rem]">
            {t("intro")}
          </p>
        </header>

        {/* An empty set leaves the heading and its run-out standing rather
            than an empty masonry with nothing in it. */}
        {photos.length > 0 ? <Gallery photos={photos} /> : null}

        {/* Run-out: keeps the last row clear of the footer below. */}
        <div className="h-24 md:h-32" />
      </main>
    </>
  );
}
