"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { cn } from "@/lib/utils";

export type MenuNavSection = {
  id: string;
  title: string;
};

/** The sections of one half of the menu, under the name that divides it off. */
export type MenuNavGroup = {
  id: string;
  label: string;
  sections: MenuNavSection[];
};

type MenuNavProps = {
  groups: MenuNavGroup[];
  /** Names the bar for assistive tech: the page's own title. */
  label: string;
  /** The word on the control that opens the list on small screens. */
  sectionsLabel: string;
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Small screens get the list on demand; the row only ever shows from md. */
const MOBILE_QUERY = "(min-width: 48rem)";

/**
 * Sticky category bar, parked just under the site nav.
 *
 * From md it is a row of chips, one per section, with a hairline marking where
 * one half of the menu gives way to the next. Below that the row would run off
 * the side of the screen and hide most of the menu, so the same sections sit
 * behind a single control that opens them as one vertical list - long enough
 * now that each half is named on the way past.
 *
 * Either way the section currently under the bar is marked active. That is
 * read off a one-pixel band placed exactly at the bar's lower edge - the
 * sections run flush into each other, so precisely one of them crosses that
 * line at a time, and the observer only wakes when the crossing changes. The
 * dividers between the halves are not sections, so the mark simply stays where
 * it was while one of them passes.
 */
export function MenuNav({ groups, label, sectionsLabel }: MenuNavProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(groups[0]?.sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  // Both halves are watched as one run, so neither the spy nor the chip row
  // has to know the menu arrives in pieces. Memoised because the observer
  // effect below depends on the list, and would otherwise reconnect on every
  // change of state here.
  const sections = useMemo(
    () => groups.flatMap((group) => group.sections),
    [groups],
  );

  const activeTitle =
    sections.find((section) => section.id === active)?.title ?? "";

  // The lock is set from the handlers rather than an effect, so a tap that
  // both closes the panel and scrolls has scrolling back before it moves.
  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, []);

  /** Where the bar's lower edge sits once it is stuck. */
  const threshold = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return 0;
    const top = Number.parseFloat(getComputedStyle(bar).top);
    return (Number.isNaN(top) ? 0 : top) + bar.offsetHeight;
  }, []);

  // The band is the only thing that watches the scroll, and an observer costs
  // nothing between crossings. Rebuilding it does cost something - measuring
  // the bar forces layout - and resize fires on every step of a phone's
  // address bar sliding away, so a rebuild waits for a frame and is skipped
  // outright unless the band it would draw has actually moved.
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let drawnLine = -1;
    let drawnHeight = -1;

    const watch = () => {
      frame = 0;

      const line = threshold();
      const height = window.innerHeight;
      if (observer && line === drawnLine && height === drawnHeight) return;

      drawnLine = line;
      drawnHeight = height;
      observer?.disconnect();

      const bottom = Math.max(0, height - line - 1);

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

    const onResize = () => {
      if (!frame) frame = requestAnimationFrame(watch);
    };

    watch();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [sections, threshold]);

  // The panel belongs to the small-screen layout only, so it goes away with it.
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      if (query.matches) close();
    };

    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [close]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Nothing should be left holding the page still if this unmounts open.
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keeps the active chip reachable in the row, which now outruns even a wide
  // screen.
  //
  // Deliberately not scrollIntoView: that walks up the ancestors and scrolls
  // whatever else it has to, and a smooth programmatic scroll that reaches the
  // document fights the reader's own - which is exactly the stutter a long run
  // of sections used to produce, one animation per section passing the bar.
  // Nudging the row by a delta only ever moves the row. The delta is measured
  // in viewport coordinates, so the reversed axis on /ar needs no special case.
  //
  // It is all done a frame later, in one read pass with no write between the
  // reads, so the measuring cannot force a second layout mid-scroll; and only
  // when the chip has actually drifted out of the middle of the row, so most
  // crossings cost a rect or two and nothing else.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const frame = requestAnimationFrame(() => {
      const chip = scroller.querySelector<HTMLElement>(
        `[data-chip="${active}"]`,
      );
      if (!chip) return;

      const row = scroller.getBoundingClientRect();
      const mark = chip.getBoundingClientRect();
      const delta = mark.left + mark.width / 2 - (row.left + row.width / 2);

      // `<=` also covers the row being laid out at no width at all, which is
      // what a display:none scroller measures as below md.
      if (Math.abs(delta) <= row.width / 4) return;

      scroller.scrollBy({
        left: delta,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [active]);

  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    event.preventDefault();
    setActive(id);
    close();
    section.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  const toggle = () => {
    if (open) {
      close();
      return;
    }

    setOpen(true);
    document.body.style.overflow = "hidden";
  };

  return (
    <>
      {/* Dims the page under the panel. It sits below the bar, so the bar and
          the site nav above it stay at full strength. */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "fixed inset-0 z-20 bg-foreground/20 md:hidden",
          "transition-[opacity,visibility] duration-500 motion-reduce:transition-none",
          EASE,
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      />

      <div
        ref={barRef}
        className={cn(
          // Parked from --menu-bar-top, which is tuned against the wordmark in
          // globals.css, so the bar follows the nav whenever the mark grows.
          "sticky top-[var(--menu-bar-top)] z-30 border-y border-foreground/10 bg-background",
          // Covers the sliver between the site nav and this bar, so nothing
          // scrolls through the join. A sticky box is already positioned, so
          // the cover hangs off it directly.
          "before:absolute before:inset-x-0 before:bottom-full before:h-10 before:bg-background",
        )}
      >
        <nav aria-label={label} className="md:hidden">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="menu-sections"
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start sm:px-6"
          >
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="tracked-label text-[0.6rem] tracking-[0.18em] uppercase opacity-45">
                {sectionsLabel}
              </span>
              <span className="tracked-label min-w-0 truncate text-[0.68rem] tracking-[0.16em] uppercase">
                {activeTitle}
              </span>
            </span>

            <svg
              viewBox="0 0 12 8"
              aria-hidden="true"
              className={cn(
                "h-2 w-3 shrink-0 transition-transform duration-500",
                "motion-reduce:transition-none",
                EASE,
                open && "rotate-180",
              )}
            >
              <path
                d="M1 1.5 6 6.5 11 1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          </button>

          <div
            id="menu-sections"
            className={cn(
              "absolute inset-x-0 top-full max-h-[62svh] overflow-y-auto overscroll-contain",
              "border-b border-foreground/10 bg-background",
              "transition-[opacity,transform,visibility] duration-500",
              "motion-reduce:transition-none",
              EASE,
              open
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0",
            )}
          >
            <div className="px-4 pb-4 sm:px-6">
              {groups.map((group) => (
                <section
                  key={group.id}
                  aria-labelledby={`sections-${group.id}`}
                >
                  {/* Which half of the menu the run below it belongs to. */}
                  <h2
                    id={`sections-${group.id}`}
                    className="tracked-label pt-6 pb-2 text-[0.58rem] tracking-[0.2em] uppercase opacity-40"
                  >
                    {group.label}
                  </h2>

                  <ul>
                    {group.sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          aria-current={
                            section.id === active ? "true" : undefined
                          }
                          onClick={(event) => jump(event, section.id)}
                          className={cn(
                            "tracked-label block border-t border-foreground/10 py-3.5",
                            "text-[0.68rem] tracking-[0.16em] uppercase",
                            section.id === active
                              ? "opacity-100"
                              : "opacity-50",
                          )}
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </nav>

        <nav
          ref={scrollerRef}
          aria-label={label}
          className="no-scrollbar hidden overflow-x-auto overscroll-x-contain md:block"
        >
          <ul className="mx-auto flex w-max min-w-full items-stretch justify-center gap-6 px-4 sm:px-6 md:gap-7 md:px-8 lg:gap-9 lg:px-12">
            {groups.map((group, groupIndex) =>
              group.sections.map((section, sectionIndex) => {
                const current = section.id === active;

                // The join between two halves, so the row reads as two runs
                // rather than one endless one. The border is logical, so it
                // lands on the leading side in both reading directions.
                const divides = groupIndex > 0 && sectionIndex === 0;

                return (
                  <li
                    key={section.id}
                    className={cn(
                      divides &&
                        "border-s border-foreground/15 ps-6 md:ps-7 lg:ps-9",
                    )}
                  >
                    <a
                      href={`#${section.id}`}
                      data-chip={section.id}
                      aria-current={current ? "true" : undefined}
                      onClick={(event) => jump(event, section.id)}
                      className={cn(
                        "tracked-label block py-4 text-[0.62rem] tracking-[0.18em] whitespace-nowrap uppercase",
                        "transition-opacity duration-300",
                        current
                          ? "opacity-100"
                          : "opacity-45 hover:opacity-80",
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
              }),
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
