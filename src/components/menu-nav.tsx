"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { cn } from "@/lib/utils";

export type MenuNavSection = {
  id: string;
  title: string;
};

/**
 * Sticky category bar: one chip per section, parked just under the site nav.
 *
 * The chip for the section currently under the bar is marked active. That is
 * read off a one-pixel band placed exactly at the bar's lower edge - the
 * sections run flush into each other, so precisely one of them crosses that
 * line at a time, and the observer only wakes when the crossing changes.
 *
 * The row scrolls sideways once the chips outrun the screen, which is the
 * usual case on a phone; the active chip is kept in view, and both that and
 * the jump to a section are instant under reduced motion.
 */
export function MenuNav({
  sections,
  label,
}: {
  sections: MenuNavSection[];
  label: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0]?.id ?? "");

  /** Where the bar's lower edge sits once it is stuck. */
  const threshold = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return 0;
    const top = Number.parseFloat(getComputedStyle(bar).top);
    return (Number.isNaN(top) ? 0 : top) + bar.offsetHeight;
  }, []);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const watch = () => {
      observer?.disconnect();

      const line = threshold();
      const bottom = Math.max(0, window.innerHeight - line - 1);

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(entry.target.id);
          }
        },
        { rootMargin: `-${line}px 0px -${bottom}px 0px` },
      );

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) observer.observe(element);
      }
    };

    watch();
    window.addEventListener("resize", watch);

    return () => {
      window.removeEventListener("resize", watch);
      observer?.disconnect();
    };
  }, [sections, threshold]);

  // Keeps the active chip reachable on the narrow screens where the row
  // scrolls. scrollIntoView handles the reversed axis on /ar, which hand-set
  // scroll offsets do not.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;

    const chip = scroller.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!chip) return;

    chip.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [active]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    event.preventDefault();
    setActive(id);
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      ref={barRef}
      className={cn(
        "sticky top-[6.75rem] z-30 border-y border-foreground/10 bg-background md:top-[9.5rem]",
        // Covers the sliver between the site nav and this bar, so nothing
        // scrolls through the join. A sticky box is already positioned, so
        // the cover hangs off it directly.
        "before:absolute before:inset-x-0 before:bottom-full before:h-10 before:bg-background",
      )}
    >
      <nav
        ref={scrollerRef}
        aria-label={label}
        className="no-scrollbar overflow-x-auto overscroll-x-contain"
      >
        <ul className="mx-auto flex w-max min-w-full items-stretch justify-center gap-7 px-4 sm:px-6 md:gap-10 md:px-8 lg:px-12">
          {sections.map((section) => {
            const current = section.id === active;

            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  data-chip={section.id}
                  aria-current={current ? "true" : undefined}
                  onClick={(event) => jump(event, section.id)}
                  className={cn(
                    "tracked-label block py-4 text-[0.62rem] tracking-[0.18em] whitespace-nowrap uppercase",
                    "transition-opacity duration-300",
                    current ? "opacity-100" : "opacity-45 hover:opacity-80",
                  )}
                >
                  <span
                    className={cn(
                      "block border-b pb-1.5",
                      current ? "border-current" : "border-transparent",
                    )}
                  >
                    {section.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
