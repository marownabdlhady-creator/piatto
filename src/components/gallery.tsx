"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { GalleryLightbox } from "@/components/gallery-lightbox";
import { RevealFallback } from "@/components/reveal-fallback";
import { galleryImages, type GalleryImage } from "@/lib/gallery";
import { useSoftReveal } from "@/lib/use-soft-reveal";

/** How much of the viewport one still takes at each width. */
const SIZES = "(min-width: 64rem) 31vw, (min-width: 40rem) 47vw, 92vw";

/** How many stills load with the page; the rest wait until they are near. */
const EAGER = 2;

/**
 * The masonry: a single column on phones, two from sm, three from lg. The
 * columns are laid by the browser rather than by hand, so a still is never
 * measured in JavaScript, nothing reflows after paint, and the run can never
 * push the page sideways. Each still declares its intrinsic size, so its box
 * is reserved before the photograph arrives.
 *
 * Clicking one opens it over the page; the trigger is remembered so focus can
 * be handed back to it when the panel closes.
 */
export function Gallery() {
  const t = useTranslations("galleryPage");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useSoftReveal(rootRef);

  const describe = useCallback(
    (image: GalleryImage) => t(`alt.${image.key}`),
    [t],
  );

  const step = useCallback((delta: number) => {
    setActive((current) => {
      if (current === null) return current;
      const count = galleryImages.length;
      return (current + delta + count) % count;
    });
  }, []);

  const onClosed = useCallback(() => {
    setActive(null);
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <div
        ref={rootRef}
        className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 md:px-8 lg:px-12"
      >
        <RevealFallback />

        <div className="columns-1 gap-4 sm:columns-2 md:gap-5 lg:columns-3 lg:gap-6">
          {galleryImages.map((image, index) => (
            <button
              key={image.key}
              type="button"
              data-reveal="panel"
              aria-haspopup="dialog"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActive(index);
              }}
              className="reveal reveal-rise group mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden bg-foreground/5 md:mb-5 lg:mb-6"
            >
              <Image
                src={image.src}
                alt={describe(image)}
                width={image.width}
                height={image.height}
                sizes={SIZES}
                loading={index < EAGER ? "eager" : "lazy"}
                className="h-auto w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.035]"
              />
            </button>
          ))}
        </div>
      </div>

      {active !== null ? (
        <GalleryLightbox
          images={galleryImages}
          index={active}
          describe={describe}
          labels={{
            close: t("close"),
            next: t("next"),
            previous: t("previous"),
          }}
          onStep={step}
          onClosed={onClosed}
        />
      ) : null}
    </>
  );
}
