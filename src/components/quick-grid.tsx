"use client";

import { useTranslations } from "next-intl";

import { NavAnchor } from "@/components/nav-anchor";
import { darkCell, darkCellRule, quickLinks } from "@/lib/nav";
import { cn } from "@/lib/utils";

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
        darkCellRule,
      )}
    >
      {quickLinks.map((item, index) => (
        <NavAnchor
          key={item.key}
          item={item}
          className={cn(
            darkCell,
            "h-[var(--grid-cell-h)]",
            index % 2 === 0 && cn("border-e", darkCellRule),
            index < 2 && cn("border-b", darkCellRule),
          )}
        >
          {t(item.key)}
        </NavAnchor>
      ))}
    </div>
  );
}
