"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { LanguageToggle } from "@/components/language-toggle";
import { QuickGrid } from "@/components/quick-grid";
import { TopBar } from "@/components/top-bar";
import { Link } from "@/i18n/navigation";
import { ENTRANCE, entranceScale } from "@/lib/entrance";
import { navItems, navUnderline, quickLinks } from "@/lib/nav";
import { cn } from "@/lib/utils";

const linkBase = cn(
  navUnderline,
  "tracked-label uppercase opacity-70 transition-opacity duration-500 hover:opacity-100",
);

/** Bar links sit tight to the row; the underline rides just under the text. */
const barLink = cn(linkBase, "pb-1.5 tracking-[0.2em] after:bottom-0");

/** Overlay links carry their own padding so each is a comfortable tap target. */
const overlayLink = cn(linkBase, "py-3 tracking-[0.24em] after:bottom-1.5");

export function SiteNav() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const rootRef = useRef<HTMLElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTimeline = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [barsHeight, setBarsHeight] = useState(0);

  const close = useCallback(() => setOpen(false), []);

  // Entrance: the dark strip leads, then the shortcut grid, the wordmark, and
  // the bar furniture (hairline and hamburger) together with the links. The
  // link stagger follows DOM order, which is also reading order in both
  // locales - leftmost first on /en, rightmost first on /ar.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const scale = entranceScale();

      gsap
        .timeline({ defaults: { ease: ENTRANCE.ease } })
        .fromTo(
          "[data-reveal='topbar']",
          { opacity: 0, y: ENTRANCE.topBar.y },
          { opacity: 1, y: 0, duration: ENTRANCE.topBar.duration * scale },
          ENTRANCE.topBar.at * scale,
        )
        .fromTo(
          "[data-reveal='grid']",
          { opacity: 0, y: ENTRANCE.grid.y },
          { opacity: 1, y: 0, duration: ENTRANCE.grid.duration * scale },
          ENTRANCE.grid.at * scale,
        )
        .fromTo(
          "[data-reveal='wordmark']",
          { opacity: 0, y: ENTRANCE.wordmark.y },
          { opacity: 1, y: 0, duration: ENTRANCE.wordmark.duration * scale },
          ENTRANCE.wordmark.at * scale,
        )
        .fromTo(
          "[data-reveal='bar']",
          { opacity: 0, y: ENTRANCE.links.y },
          { opacity: 1, y: 0, duration: ENTRANCE.links.duration * scale },
          ENTRANCE.links.at * scale,
        )
        .fromTo(
          "[data-reveal='link']",
          { opacity: 0, y: ENTRANCE.links.y },
          {
            opacity: 1,
            y: 0,
            duration: ENTRANCE.links.duration * scale,
            stagger: ENTRANCE.links.stagger * scale,
          },
          ENTRANCE.links.at * scale,
        );

      overlayTimeline.current = gsap
        .timeline({ paused: true, defaults: { ease: ENTRANCE.ease } })
        .fromTo(
          overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.55 * scale, ease: "power3.out" },
        )
        .fromTo(
          "[data-reveal='overlay-link']",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.85 * scale, stagger: 0.05 * scale },
          0.15 * scale,
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // The menu opens below whatever bars are showing, and that stack differs by
  // breakpoint - the strip and the grid are small-screen only. Measuring it
  // beats keeping a pile of magic offsets in step by hand.
  useEffect(() => {
    const element = barsRef.current;
    if (!element) return;

    const measure = () => setBarsHeight(element.offsetHeight);
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timeline = overlayTimeline.current;
    if (!timeline) return;
    if (open) timeline.play();
    else timeline.reverse();
  }, [open]);

  // Lock scrolling and allow Escape to dismiss while the overlay is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const sections = navItems.map((item) => ({ ...item, label: t(item.key) }));
  const shortcuts = quickLinks.map((item) => ({ ...item, label: t(item.key) }));

  return (
    <header id="top" ref={rootRef} className="relative z-20 bg-background">
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div ref={barsRef}>
        <TopBar />
        <QuickGrid />

        <div className="relative px-4 text-foreground sm:px-6 md:px-8 md:pt-9 lg:px-12">
          {/* The wordmark is centred at every width; the hamburger sits at the
              inline end of the same row, so it mirrors on /ar. */}
          <div className="relative z-30 flex h-[var(--bar-main-h)] items-center justify-center md:h-auto">
            <a
              href="#top"
              data-reveal="wordmark"
              className="reveal -me-[0.16em] block text-center text-[1.45rem] leading-none font-normal tracking-[0.16em] lowercase sm:text-[1.6rem] md:text-[1.9rem]"
            >
              {tCommon("siteName")}
            </a>

            <button
              type="button"
              data-reveal="bar"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              className="reveal absolute inset-y-0 end-[-0.625rem] my-auto flex h-11 w-11 flex-col items-center justify-center gap-[7px]"
            >
              <span
                className={cn(
                  "h-px w-[22px] bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  open && "translate-y-[4px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-[22px] bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  open && "-translate-y-[4px] -rotate-45",
                )}
              />
            </button>
          </div>

          {/* Full-bleed rule: the bar's bottom edge on small screens, the
              divider between wordmark and links from md. */}
          <div
            data-reveal="bar"
            aria-hidden="true"
            className="reveal relative z-30 -mx-4 h-px bg-foreground/10 sm:-mx-6 md:-mx-8 md:mt-6 lg:-mx-12"
          />

          {/* Curated desktop row. The complete set of sections lives in the
              overlay behind the hamburger. */}
          <nav
            aria-label={tCommon("siteName")}
            className="hidden md:mt-6 md:flex md:justify-center"
          >
            <ul className="flex items-center gap-8 text-[0.7rem] lg:gap-12">
              {shortcuts.map((item) => (
                <li key={item.key}>
                  <a
                    href={item.href}
                    data-reveal="link"
                    className={cn("reveal", barLink)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/reservations"
                  data-reveal="link"
                  className={cn("reveal", barLink)}
                >
                  {t("reservations")}
                </Link>
              </li>
              <li
                data-reveal="link"
                className="reveal border-s border-foreground/15 ps-8 lg:ps-12"
              >
                <LanguageToggle
                  label={t("switchLanguage")}
                  labelClassName={barLink}
                />
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* The complete menu, at every width. It opens just below the bars, which
          stay in place, so the hamburger-turned-X is the close affordance. */}
      <div
        id="site-menu"
        ref={overlayRef}
        style={{ top: barsHeight }}
        className="invisible fixed inset-x-0 bottom-0 z-20 flex flex-col items-center overflow-y-auto bg-background px-6 py-10 text-foreground opacity-0"
      >
        <nav
          aria-label={tCommon("siteName")}
          className="my-auto w-full max-w-xs md:max-w-sm"
        >
          <ul className="flex flex-col items-center gap-3 text-center text-[1.05rem] md:gap-4 md:text-[1.2rem]">
            {sections.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={close}
                  data-reveal="overlay-link"
                  className={overlayLink}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
