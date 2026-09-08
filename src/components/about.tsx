"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

import { ENTRANCE, entranceScale } from "@/lib/entrance";

const PARAGRAPHS = ["p1", "p2", "p3"] as const;
const LOGO_SLOTS = [0, 1, 2, 3];

/**
 * Placeholder About section: centred copy over an off-white ground, with a row
 * of empty logo plates beneath it. Every string here is deliberately temporary.
 */
export function About() {
  const t = useTranslations("about");
  const rootRef = useRef<HTMLElement>(null);

  // Reveals once, the first time the section comes into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = root.querySelectorAll("[data-reveal='about']");

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
  }, []);

  return (
    <section
      id="about"
      ref={rootRef}
      className="bg-background px-4 py-24 text-foreground sm:px-6 md:px-8 md:py-32 lg:px-12 lg:py-40"
    >
      <div className="mx-auto flex max-w-[38rem] flex-col gap-6 text-center md:gap-7">
        {PARAGRAPHS.map((key) => (
          <p
            key={key}
            data-reveal="about"
            className="reveal text-[0.95rem] leading-[2.1] opacity-80 md:text-[1.05rem]"
          >
            {t(key)}
          </p>
        ))}
      </div>

      <ul className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-5 md:mt-28 md:grid-cols-4 md:gap-10">
        {LOGO_SLOTS.map((slot) => (
          <li key={slot} data-reveal="about" className="reveal">
            <div className="tracked-label flex h-20 items-center justify-center border border-foreground/15 text-[0.62rem] tracking-[0.2em] uppercase opacity-40 md:h-24">
              {t("logo")}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
