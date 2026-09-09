"use client";

import { useEffect, type RefObject } from "react";

/** Marks the layer inside an image frame that drifts against the scroll. */
export const PARALLAX_SELECTOR = "[data-parallax]";

/**
 * How far a layer travels each way across a full pass of the viewport, as a
 * share of its frame's height, and the scale that keeps that travel hidden
 * behind the frame's edges. The scale is duplicated as a class on the layer,
 * so the framing is identical whether or not the drift is running.
 */
const TRAVEL = 0.06;
const SCALE = 1.16;

/**
 * A restrained parallax: each framed image drifts a few percent against the
 * scroll, so the page has some depth without anything visibly moving.
 *
 * Only in-view layers are touched, only ever through `transform`, and only
 * once per frame off a passive scroll listener - so the whole effect is a
 * handful of composited transforms. It is held back entirely on small screens
 * and under reduced motion, where the layers keep the static framing their
 * class gives them.
 */
export function useParallax(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const layers = Array.from(
      root.querySelectorAll<HTMLElement>(PARALLAX_SELECTOR),
    );
    if (layers.length === 0) return;

    const query = window.matchMedia(
      "(min-width: 48rem) and (prefers-reduced-motion: no-preference)",
    );

    let stop: (() => void) | null = null;

    const start = () => {
      const visible = new Set<HTMLElement>();
      let frame = 0;

      const update = () => {
        frame = 0;
        const viewport = window.innerHeight;

        for (const layer of visible) {
          const rect = (layer.parentElement ?? layer).getBoundingClientRect();
          // -1 while the frame sits just below the fold, +1 once it has just
          // cleared the top, so the drift is centred on the frame's pass.
          const progress =
            ((viewport - rect.top) / (viewport + rect.height)) * 2 - 1;
          const shift = (progress * rect.height * TRAVEL).toFixed(2);
          layer.style.transform = `translate3d(0, ${shift}px, 0) scale(${SCALE})`;
        }
      };

      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const layer = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visible.add(layer);
            layer.style.willChange = "transform";
          } else {
            visible.delete(layer);
            layer.style.willChange = "";
          }
        }
        schedule();
      });

      for (const layer of layers) observer.observe(layer);
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();

      stop = () => {
        observer.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (frame) cancelAnimationFrame(frame);
        // Hands the framing back to the class.
        for (const layer of layers) {
          layer.style.transform = "";
          layer.style.willChange = "";
        }
      };
    };

    const sync = () => {
      stop?.();
      stop = null;
      if (query.matches) start();
    };

    sync();
    query.addEventListener("change", sync);

    return () => {
      query.removeEventListener("change", sync);
      stop?.();
    };
  }, [ref]);
}
