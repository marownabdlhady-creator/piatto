"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { LanguageToggle } from "@/components/language-toggle";
import { ENTRANCE, entranceScale } from "@/lib/entrance";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

const linkBase =
  "tracked-label relative inline-block pb-1.5 uppercase opacity-70 " +
  "transition-opacity duration-500 hover:opacity-100 " +
  "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center " +
  "after:scale-x-0 after:bg-current after:transition-transform after:duration-500 " +
  "after:ease-[cubic-bezier(0.22,1,0.36,1)] after:content-[''] hover:after:scale-x-100";

export function SiteNav() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayTimeline = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Entrance: the wordmark settles first, then the hairline and links rise in
  // just behind it. The stagger follows DOM order, which is also reading order
  // in both locales — leftmost first on /en, rightmost first on /ar.
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
          { autoAlpha: 1, duration: 0.7 * scale, ease: "power3.out" },
        )
        .fromTo(
          "[data-reveal='overlay-link']",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.9 * scale, stagger: 0.06 * scale },
          `-=${0.4 * scale}`,
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

      <div className="relative px-6 pt-7 md:pt-9">
        <a
          href="#top"
          data-reveal="wordmark"
          className="reveal -me-[0.16em] block text-center text-[1.6rem] leading-none font-normal tracking-[0.16em] lowercase md:text-[1.9rem]"
        >
          {tCommon("siteName")}
        </a>

        {/* Editorial rule separating the wordmark from the links row. It only
            appears alongside the row itself, so it is hidden on small screens. */}
        <div
          data-reveal="link"
          aria-hidden="true"
          className="reveal -mx-6 mt-5 hidden h-px bg-foreground/10 md:mt-6 md:block"
        />

        <nav
          aria-label={tCommon("siteName")}
          className="mt-5 hidden justify-center md:mt-6 md:flex"
        >
          <ul className="flex items-center gap-9 text-[0.7rem] lg:gap-14">
            {links.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  data-reveal="link"
                  className={cn("reveal tracking-[0.2em]", linkBase)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li
              data-reveal="link"
              className="reveal border-s border-foreground/15 ps-9 lg:ps-14"
            >
              <LanguageToggle
                label={t("switchLanguage")}
                className={cn("tracking-[0.2em]", linkBase)}
              />
            </li>
          </ul>
        </nav>

        <button
          type="button"
          data-reveal="link"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          className="reveal absolute end-5 top-0 bottom-0 z-30 my-auto flex h-8 w-8 flex-col items-center justify-center gap-[7px] md:hidden"
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

      <div
        id="mobile-menu"
        ref={overlayRef}
        className="invisible fixed inset-0 z-20 flex flex-col items-center justify-center bg-background text-foreground opacity-0 md:hidden"
      >
        <nav aria-label={tCommon("siteName")}>
          <ul className="flex flex-col items-center gap-9 text-center text-[0.95rem]">
            {links.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={close}
                  data-reveal="overlay-link"
                  className={cn("tracking-[0.26em]", linkBase)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li
              data-reveal="overlay-link"
              className="mt-4 border-t border-foreground/15 pt-9"
            >
              <LanguageToggle
                label={t("switchLanguage")}
                onNavigate={close}
                className={cn("text-[0.8rem] tracking-[0.26em]", linkBase)}
              />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
