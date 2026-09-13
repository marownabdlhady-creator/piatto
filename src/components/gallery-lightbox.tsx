"use client";

import { useCallback, useEffect, useRef, type TouchEvent } from "react";
import Image from "next/image";
import gsap from "gsap";

import { ENTRANCE, entranceScale } from "@/lib/entrance";
import type { GalleryPhoto } from "@/lib/gallery-data";

/** True while the document is laid out right to left. */
function isRtl() {
  return document.documentElement.dir === "rtl";
}

/** A swipe shorter than this, or one that is mostly vertical, is ignored. */
const SWIPE_THRESHOLD = 48;

type Labels = {
  close: string;
  next: string;
  previous: string;
};

type GalleryLightboxProps = {
  photos: readonly GalleryPhoto[];
  index: number;
  labels: Labels;
  /** Moves by whole steps through the set; the caller wraps at both ends. */
  onStep: (delta: number) => void;
  /** Called once the exit tween has finished, so the caller can unmount. */
  onClosed: () => void;
};

/**
 * The enlarged view: one still centred over a dark scrim, with the set stepped
 * through by arrows, keys or a swipe. Mounted only while a still is open.
 *
 * Nothing here is mirrored by hand. The furniture is positioned with logical
 * properties, and the two things that do carry a direction - which arrow key
 * advances, and which way a swipe reads - are resolved against the rendered
 * dir, so "next" always means further along the set in both locales.
 */
export function GalleryLightbox({
  photos,
  index,
  labels,
  onStep,
  onClosed,
}: GalleryLightboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const closing = useRef(false);
  /** Which way the last step went, so the incoming still enters from there. */
  const direction = useRef(1);
  const shown = useRef(index);

  const photo = photos[index];

  const go = useCallback(
    (delta: number) => {
      // A key held down through the exit tween must not step the set on.
      if (closing.current) return;
      direction.current = delta;
      onStep(delta);
    },
    [onStep],
  );

  // Exit is played here rather than by the caller, so the panel is still
  // mounted while it runs; unmounting is what onClosed goes on to do.
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;

    if (entranceScale() === 0) {
      onClosed();
      return;
    }

    gsap
      .timeline({ onComplete: onClosed })
      .to(
        frameRef.current,
        { autoAlpha: 0, scale: 0.97, duration: 0.32, ease: "power3.in" },
        0,
      )
      .to(
        scrimRef.current,
        { autoAlpha: 0, duration: 0.42, ease: "power2.inOut" },
        0.04,
      );
  }, [onClosed]);

  // Entrance: the scrim washes in and the still settles up into place. Both
  // start hidden in CSS, so neither paints for a frame before the tween.
  useEffect(() => {
    const scale = entranceScale();
    const targets = [scrimRef.current, frameRef.current];

    if (scale === 0) {
      gsap.set(targets, { autoAlpha: 1, scale: 1, y: 0 });
      return;
    }

    const timeline = gsap
      .timeline({ defaults: { ease: ENTRANCE.ease } })
      .fromTo(
        scrimRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        0,
      )
      .fromTo(
        frameRef.current,
        { autoAlpha: 0, scale: 0.94, y: 20 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.9 },
        0.06,
      );

    return () => {
      timeline.kill();
    };
  }, []);

  // Each further still crosses in from the side it was called from, which is
  // the visual side in both locales - transforms are not mirrored by dir.
  useEffect(() => {
    if (shown.current === index) return;
    shown.current = index;

    if (entranceScale() === 0) return;

    const from = direction.current * (isRtl() ? -1 : 1) * 28;

    const tween = gsap.fromTo(
      slideRef.current,
      { opacity: 0, x: from },
      { opacity: 1, x: 0, duration: 0.7, ease: ENTRANCE.ease },
    );

    return () => {
      tween.kill();
    };
  }, [index]);

  // Hold the page still behind the scrim while the panel is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Focus starts on the close button and is kept inside the panel; the caller
  // hands it back to the still that was clicked once the panel is gone.
  useEffect(() => {
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(isRtl() ? -1 : 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(isRtl() ? 1 : -1);
        return;
      }

      if (event.key !== "Tab") return;

      // Off-screen at this width means the arrows are display:none, and
      // focus must not be handed to something that cannot be seen.
      const focusable = Array.from(
        rootRef.current?.querySelectorAll("button") ?? [],
      ).filter((button) => button.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go, requestClose]);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    // Dragging towards the inline start pulls the next still in behind it.
    const forward = isRtl() ? dx > 0 : dx < 0;
    go(forward ? 1 : -1);
  };

  // Written with the photograph, or translated for the set that ships with
  // the app; either way the page has already resolved it.
  const description = photo.alt;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={description}
      className="fixed inset-0 z-50"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        ref={scrimRef}
        onClick={requestClose}
        aria-hidden="true"
        className="invisible absolute inset-0 bg-[#0b0a09]/95 opacity-0"
      />

      {/* Furniture rides above the scrim in its own pass-through layer: only
          the controls and the still itself take pointer events, so a click on
          the space around them reaches the scrim and dismisses the panel. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col text-background">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-8 md:py-6 lg:px-12">
          <span
            dir="ltr"
            className="tracked-label pointer-events-none text-[0.66rem] tracking-[0.22em] tabular-nums opacity-60"
          >
            {index + 1} / {photos.length}
          </span>

          <button
            ref={closeRef}
            type="button"
            onClick={requestClose}
            aria-label={labels.close}
            className="pointer-events-auto relative -me-3 flex h-12 w-12 items-center justify-center opacity-70 transition-opacity duration-500 hover:opacity-100"
          >
            <span className="absolute h-px w-[26px] rotate-45 bg-current" />
            <span className="absolute h-px w-[26px] -rotate-45 bg-current" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-2 sm:px-6 md:px-20 lg:px-28">
          <figure
            ref={frameRef}
            className="pointer-events-auto invisible flex max-h-full flex-col items-center opacity-0"
          >
            <div ref={slideRef} className="flex min-h-0 justify-center">
              <Image
                key={photo.url}
                src={photo.url}
                alt={description}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1024px) 70vw, (min-width: 768px) 80vw, 92vw"
                loading="eager"
                fetchPriority="high"
                className="h-auto max-h-[72svh] w-auto object-contain md:max-h-[76svh]"
              />
            </div>

            <figcaption className="mt-6 max-w-[34rem] text-center text-[0.78rem] leading-[1.8] text-pretty opacity-60 md:text-[0.82rem]">
              {description}
            </figcaption>
          </figure>
        </div>

        {/* Arrows sit at the inline edges, so they swap sides on /ar; the
            chevrons are flipped with them so each still points outwards. */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={labels.previous}
          className="pointer-events-auto absolute inset-y-0 start-0 my-auto hidden h-14 w-14 items-center justify-center opacity-60 transition-opacity duration-500 hover:opacity-100 md:flex md:start-3 lg:start-6"
        >
          <Chevron />
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label={labels.next}
          className="pointer-events-auto absolute inset-y-0 end-0 my-auto hidden h-14 w-14 rotate-180 items-center justify-center opacity-60 transition-opacity duration-500 hover:opacity-100 md:flex md:end-3 lg:end-6"
        >
          <Chevron />
        </button>
      </div>
    </div>
  );
}

/** Points towards the inline start; the trailing arrow turns it around. */
function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-7 w-7 rtl:-scale-x-100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
    >
      <path d="M15 4 L7 12 L15 20" />
    </svg>
  );
}
