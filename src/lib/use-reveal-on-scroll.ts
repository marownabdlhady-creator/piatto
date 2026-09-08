"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

import { ENTRANCE, entranceScale } from "@/lib/entrance";

/**
 * Fades and lifts everything matching `selector` inside `ref`, once, the first
 * time the container scrolls into view. Under reduced motion the elements are
 * simply put in their final state.
 */
export function useRevealOnScroll(
  ref: RefObject<HTMLElement | null>,
  selector: string,
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll(selector);

    if (entranceScale() === 0) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        gsap.fromTo(
          targets,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 1.3,
            stagger: 0.09,
            ease: ENTRANCE.ease,
          },
        );
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [ref, selector]);
}
