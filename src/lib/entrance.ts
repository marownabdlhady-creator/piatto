/**
 * Shared timing for the one-shot page entrance. The nav bar and the hero panel
 * animate from separate components, so the positions below are absolute
 * (seconds from the start of the load) to keep them reading as a single,
 * cohesive move rather than three separate animations.
 */
export const ENTRANCE = {
  ease: "power4.out",
  wordmark: { at: 0.1, duration: 1.3, y: 26 },
  links: { at: 0.45, duration: 1.1, stagger: 0.07, y: 18 },
  panel: { at: 0.72, duration: 1.4, y: 24 },
} as const;

/**
 * Multiplier applied to every duration, delay and stagger: 1 normally, 0 when
 * the visitor asked for reduced motion, which collapses the entrance into an
 * instant jump to the final state.
 */
export function entranceScale(): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
}
