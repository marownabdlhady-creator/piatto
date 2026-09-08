"use client";

import { useTranslations } from "next-intl";

import { quickLinks } from "@/lib/nav";
import { cn } from "@/lib/utils";

const hairline = "border-background/20";

/**
 * Small-screen shortcut grid: four dark cells sitting under the action strip,
 * split by hairlines. The end-border on the first column and the bottom border
 * on the first row are logical, so the divider lands between the cells in both
 * reading directions. Hidden from md, where the full links row takes over.
 */
export function QuickGrid() {
  const t = useTranslations("nav");

  return (
    <div
      data-reveal="grid"
      className={cn(
        "reveal relative z-30 grid grid-cols-2 border-t bg-foreground text-background md:hidden",
        hairline,
      )}
    >
      {quickLinks.map((item, index) => (
        <a
          key={item.key}
          href={item.href}
          className={cn(
            "tracked-label flex h-[var(--grid-cell-h)] items-center justify-center px-3 text-center text-[0.62rem] tracking-[0.18em] uppercase opacity-80 transition-opacity duration-500 hover:opacity-100",
            index % 2 === 0 && cn("border-e", hairline),
            index < 2 && cn("border-b", hairline),
          )}
        >
          {t(item.key)}
        </a>
      ))}
    </div>
  );
}
