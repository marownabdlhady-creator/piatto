"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { QuickGrid } from "@/components/quick-grid";
import { TopBar } from "@/components/top-bar";
import { ENTRANCE, entranceScale } from "@/lib/entrance";
import { navItems, navUnderline } from "@/lib/nav";
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTimeline = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Entrance: the dark strip leads, the wordmark settles, then the bar
  // furniture (the hairline and, on small screens, the hamburger) and the
  // links rise in together just behind it. The link stagger follows DOM order,
  // which is also reading order in both locales - leftmost first on /en,
  // rightmost first on /ar.
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

  // The overlay only exists below md. Growing past that breakpoint while it is
  // open would hide it with the scroll lock still applied, so close it instead.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 48rem)");
    const sync = () => {
      if (query.matches) setOpen(false);
    };

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const links = navItems.map((item) => ({ ...item, label: t(item.key) }));

  return (
    <header id="top" ref={rootRef} className="relative z-20 bg-background">
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <TopBar />
      <QuickGrid />

      <div className="relative px-4 text-foreground sm:px-6 md:px-8 lg:px-12">
        {/* Small screens: wordmark on the inline start, hamburger on the
            inline end. From md the row becomes the top half of the stacked
            bar, with the wordmark centred over the links. */}
        <div className="relative z-30 flex h-[var(--bar-main-h)] items-center justify-between md:block md:h-auto md:pt-9">
          <a
            href="#top"
            data-reveal="wordmark"
            className="reveal -me-[0.16em] block text-[1.45rem] leading-none font-normal tracking-[0.16em] lowercase sm:text-[1.6rem] md:text-center md:text-[1.9rem]"
          >
            {tCommon("siteName")}
          </a>

          <button
            type="button"
            data-reveal="bar"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            className="reveal -me-[0.625rem] flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[7px] md:hidden"
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

        {/* Full-bleed rule: the bar's bottom edge on small screens, the divider
            between wordmark and links from md. */}
        <div
          data-reveal="bar"
          aria-hidden="true"
          className="reveal relative z-30 -mx-4 h-px bg-foreground/10 sm:-mx-6 md:-mx-8 md:mt-6 lg:-mx-12"
        />

        <nav
          aria-label={tCommon("siteName")}
          className="hidden md:mt-6 md:flex md:justify-center"
        >
          <ul className="flex items-center gap-8 text-[0.7rem] lg:gap-14">
            {links.map((item) => (
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
          </ul>
        </nav>
      </div>

      {/* Small-screen menu. It fills the page from just below the bars down,
          leaving both of them in place, so the hamburger-turned-X stays put as
          the close affordance. */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        className="invisible fixed inset-x-0 bottom-0 top-[var(--bars-h)] z-20 flex flex-col items-center overflow-y-auto bg-background px-6 py-10 text-foreground opacity-0 md:hidden"
      >
        <nav aria-label={tCommon("siteName")} className="my-auto w-full max-w-xs">
          <ul className="flex flex-col items-center gap-3 text-center text-[1.05rem]">
            {links.map((item) => (
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
