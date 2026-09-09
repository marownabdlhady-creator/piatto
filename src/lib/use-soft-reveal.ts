"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

import { ENTRANCE, entranceScale } from "@/lib/entrance";

/** Marks a panel: it fades and rises. */
export const PANEL_SELECTOR = "[data-reveal='panel']";

/**
 * The image-panel entrance shared by the Spaces and Features sections. Each
 * panel fades and rises once, the first time it scrolls into view. Only
 * opacity and transform animate - no filters, nothing that affects layout -
 * so the move stays on the compositor and nothing around the panels shifts.
 *
 * Panels are watched one by one rather than by section, so a tall run of them
 * does not spend its whole entrance off-screen. Panels that arrive together -
 * a side-by-side row - are staggered against each other in DOM order, which is
 * reading order in both locales, so they cascade from the right on /ar.
 */
export function useSoftReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const panels = Array.from(root.querySelectorAll(PANEL_SELECTOR));
    if (panels.length === 0) return;

    // The hidden state is declared in CSS, so it cannot be dropped with
    // clearProps - the final values have to be written back over it.
    const settle = (targets: Element[]) =>
      gsap.set(targets, { opacity: 1, y: 0, willChange: "auto" });

    if (entranceScale() === 0) {
      settle(panels);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target)
          // Callback order is not document order, and the stagger reads off it.
          .sort((a, b) => panels.indexOf(a) - panels.indexOf(b));

        if (arriving.length === 0) return;

        for (const panel of arriving) observer.unobserve(panel);

        // Promoted here rather than in the class, so large panels are not held
        // on their own compositor layers from page load.
        gsap.set(arriving, { willChange: "transform, opacity" });

        gsap.fromTo(
          arriving,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.14,
            ease: ENTRANCE.ease,
            onComplete: () => settle(arriving),
          },
        );
      },
      { rootMargin: "0px 0px -15% 0px" },
    );

    for (const panel of panels) observer.observe(panel);
    return () => observer.disconnect();
  }, [ref]);
}
