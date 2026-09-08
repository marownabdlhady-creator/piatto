"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { CompactBar } from "@/components/compact-bar";
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

/** Drawer links carry their own padding so each is a comfortable tap target. */
const drawerLink = cn(linkBase, "py-3 tracking-[0.24em] after:bottom-1.5");

export function SiteNav() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const rootRef = useRef<HTMLElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const collapsibleRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerTimeline = useRef<gsap.core.Timeline | null>(null);
  const hasOpened = useRef(false);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsibleHeight, setCollapsibleHeight] = useState(0);

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

      // The drawer is anchored to the inline end, so it leaves towards the
      // right on /en and the left on /ar. Transforms are not mirrored by
      // direction, so the sign comes from the rendered dir attribute.
      const fromEdge = document.documentElement.dir === "rtl" ? -100 : 100;

      drawerTimeline.current = gsap
        .timeline({ paused: true, defaults: { ease: ENTRANCE.ease } })
        .fromTo(
          scrimRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5 * scale, ease: "power2.out" },
          0,
        )
        .fromTo(
          drawerRef.current,
          { autoAlpha: 0, xPercent: fromEdge },
          { autoAlpha: 1, xPercent: 0, duration: 0.75 * scale },
          0,
        )
        .fromTo(
          "[data-reveal='drawer-link']",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8 * scale, stagger: 0.05 * scale },
          0.18 * scale,
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const timeline = drawerTimeline.current;
    if (!timeline) return;
    if (open) timeline.play();
    else timeline.reverse();
  }, [open]);

  // Move focus into the drawer on open and hand it back to the hamburger on
  // close. The rAF waits for the tween to make the panel visible first.
  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      const frame = requestAnimationFrame(() => closeRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }

    if (hasOpened.current) triggerRef.current?.focus();
  }, [open]);

  // Small screens collapse to the wordmark row plus a two-cell dark bar once
  // the page moves. The dark blocks above are slid out of view rather than
  // removed from flow, so the bar's box - and everything below it - never
  // shifts. On desktop those blocks are display:none, the measured distance is
  // zero, and the compact bar is hidden, so nothing moves.
  useEffect(() => {
    const element = collapsibleRef.current;
    if (!element) return;

    const measure = () => setCollapsibleHeight(element.offsetHeight);
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Hysteresis, so a scroll that hovers on the threshold cannot flicker.
      setCollapsed((current) => (current ? y > 12 : y > 56));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    const compact = compactRef.current;
    if (!shell || !compact) return;

    const scale = entranceScale();
    const settings = { ease: ENTRANCE.ease, overwrite: "auto" } as const;

    gsap.to(shell, {
      ...settings,
      y: collapsed ? -collapsibleHeight : 0,
      duration: 0.6 * scale,
    });
    gsap.to(compact, {
      ...settings,
      autoAlpha: collapsed ? 1 : 0,
      duration: 0.45 * scale,
    });
  }, [collapsed, collapsibleHeight]);

  // Lock scrolling and allow Escape to dismiss while the drawer is open.
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
    <header
      id="top"
      ref={rootRef}
      className="pointer-events-none sticky top-0 z-40"
    >
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      {/* Shell: the part that slides up out of view when the bar collapses. */}
      <div
        ref={shellRef}
        className="pointer-events-auto relative bg-background"
      >
        <div ref={collapsibleRef}>
          <TopBar />
          <QuickGrid />
        </div>

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
              ref={triggerRef}
              type="button"
              data-reveal="bar"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={t("openMenu")}
              className="reveal absolute inset-y-0 end-[-7px] my-auto flex h-12 w-12 flex-col items-center justify-center gap-[10px]"
            >
              <span className="h-px w-[34px] bg-current" />
              <span className="h-px w-[34px] bg-current" />
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
            drawer behind the hamburger. */}
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

        {/* Sits just under the shell, so it comes into view as the dark blocks
            above slide out. Small screens only. */}
        <div
          ref={compactRef}
          className="invisible absolute inset-x-0 top-full opacity-0 md:hidden"
        >
          <CompactBar />
        </div>
      </div>

      {/* Scrim: dims the page, which stays visible beside the panel. */}
      <div
        ref={scrimRef}
        onClick={close}
        aria-hidden="true"
        className="pointer-events-auto invisible fixed inset-0 z-40 bg-foreground/25 opacity-0"
      />

      {/* Slim drawer anchored to the inline end, so it enters from the same
          side as the hamburger: right on /en, left on /ar. */}
      <aside
        id="site-menu"
        ref={drawerRef}
        role="dialog"
        aria-label={tCommon("siteName")}
        className="pointer-events-auto invisible fixed inset-y-0 end-0 z-50 flex w-[76%] max-w-80 flex-col overflow-y-auto bg-background text-foreground opacity-0 md:w-80"
      >
        <div className="flex justify-end px-6 py-5 md:px-8">
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={t("closeMenu")}
            className="relative -me-[11px] flex h-12 w-12 items-center justify-center"
          >
            <span className="absolute h-px w-[26px] rotate-45 bg-current" />
            <span className="absolute h-px w-[26px] -rotate-45 bg-current" />
          </button>
        </div>

        <nav
          aria-label={tCommon("siteName")}
          className="px-8 pt-6 pb-12 md:px-9"
        >
          <ul className="flex flex-col items-start gap-2 text-start text-[1.05rem]">
            {sections.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={close}
                  data-reveal="drawer-link"
                  className={drawerLink}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </header>
  );
}
