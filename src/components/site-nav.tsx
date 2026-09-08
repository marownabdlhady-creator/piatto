"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { LanguageToggle } from "@/components/language-toggle";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

const EASE = "power4.out";

const linkBase =
  "tracked-label relative inline-block uppercase transition-opacity duration-500 " +
  "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-center " +
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

  // Entrance: the wordmark settles first, then the links rise in behind it.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const scale = reduced ? 0 : 1;

      gsap
        .timeline({ defaults: { ease: EASE } })
        .fromTo(
          "[data-reveal='wordmark']",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1.6 * scale, delay: 0.15 * scale },
        )
        .fromTo(
          "[data-reveal='link']",
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2 * scale,
            stagger: 0.07 * scale,
          },
          `-=${1.1 * scale}`,
        );

      overlayTimeline.current = gsap
        .timeline({ paused: true, defaults: { ease: EASE } })
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
      ref={rootRef}
      className="absolute inset-x-0 top-0 z-20 text-background"
    >
      <noscript>
        <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative px-6 pt-8 md:pt-10">
        <a
          href="#top"
          data-reveal="wordmark"
          className="reveal -me-[0.4em] block text-center text-[1.7rem] leading-none font-normal tracking-[0.4em] lowercase md:text-[2.1rem]"
        >
          {tCommon("siteName")}
        </a>

        <nav
          aria-label={tCommon("siteName")}
          className="mt-6 hidden justify-center md:mt-8 md:flex"
        >
          <ul className="flex items-center gap-9 text-[0.7rem] lg:gap-14">
            {links.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  data-reveal="link"
                  className={cn(
                    "reveal tracking-[0.22em] opacity-80 hover:opacity-100",
                    linkBase,
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li
              data-reveal="link"
              className="reveal border-s border-background/25 ps-9 lg:ps-14"
            >
              <LanguageToggle
                label={t("switchLanguage")}
                className={cn(
                  "tracking-[0.22em] opacity-80 hover:opacity-100",
                  linkBase,
                )}
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
          className="reveal absolute end-6 top-8 z-30 flex h-8 w-8 flex-col items-center justify-center gap-[7px] md:hidden"
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
        className="invisible fixed inset-0 z-20 flex flex-col items-center justify-center bg-foreground text-background opacity-0 md:hidden"
      >
        <nav aria-label={tCommon("siteName")}>
          <ul className="flex flex-col items-center gap-9 text-center text-[0.95rem]">
            {links.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={close}
                  data-reveal="overlay-link"
                  className={cn("tracking-[0.28em]", linkBase)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li
              data-reveal="overlay-link"
              className="mt-4 border-t border-background/20 pt-9"
            >
              <LanguageToggle
                label={t("switchLanguage")}
                onNavigate={close}
                className={cn("text-[0.8rem] tracking-[0.28em]", linkBase)}
              />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
