"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { LanguageToggle } from "@/components/language-toggle";
import { ENTRANCE, entranceScale } from "@/lib/entrance";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Hairline that wipes in from the centre on hover. */
const underline =
  "relative inline-block after:absolute after:inset-x-0 after:h-px after:origin-center " +
  "after:scale-x-0 after:bg-current after:transition-transform after:duration-500 " +
  "after:ease-[cubic-bezier(0.22,1,0.36,1)] after:content-[''] hover:after:scale-x-100";

const linkBase = cn(
  "tracked-label uppercase opacity-70 transition-opacity duration-500 hover:opacity-100",
  underline,
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

  // Entrance: the wordmark settles first, then the bar furniture (the hairline
  // and, on small screens, the hamburger) and the links rise in together just
  // behind it. The link stagger follows DOM order, which is also reading order
  // in both locales - leftmost first on /en, rightmost first on /ar.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const scale = entranceScale();

      gsap
        .timeline({ defaults: { ease: ENTRANCE.ease } })
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
    <header
      id="top"
      ref={rootRef}
      className="relative z-20 bg-background text-foreground"
    >
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Small screens: wordmark centred with the hamburger on the inline
            end. From md the row becomes the top half of the stacked bar. */}
        <div className="relative flex h-18 items-center justify-center md:block md:h-auto md:pt-9">
          <a
            href="#top"
            data-reveal="wordmark"
            className="reveal relative z-30 -me-[0.16em] block text-center text-[1.45rem] leading-none font-normal tracking-[0.16em] lowercase sm:text-[1.6rem] md:text-[1.9rem]"
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
            className="reveal absolute inset-y-0 end-[-0.625rem] z-30 my-auto flex h-11 w-11 flex-col items-center justify-center gap-[7px] md:hidden"
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
            between wordmark and links from md. It stays above the overlay so
            the bar reads as intact while the menu is open. */}
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
            <li
              data-reveal="link"
              className="reveal border-s border-foreground/15 ps-8 lg:ps-14"
            >
              <LanguageToggle label={t("switchLanguage")} className={barLink} />
            </li>
          </ul>
        </nav>
      </div>

      {/* Small-screen menu. It fills the page beneath the bar, which stays
          visible above it, so the hamburger doubles as the close affordance. */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        className="invisible fixed inset-0 z-20 flex flex-col items-center justify-center bg-background px-6 pt-18 text-foreground opacity-0 md:hidden"
      >
        <nav aria-label={tCommon("siteName")} className="w-full max-w-xs">
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
            <li
              data-reveal="overlay-link"
              className="mt-6 w-full border-t border-foreground/15 pt-6"
            >
              <LanguageToggle
                label={t("switchLanguage")}
                onNavigate={close}
                className={cn(overlayLink, "text-[0.85rem]")}
              />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
