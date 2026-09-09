"use client";

import { useTranslations } from "next-intl";

import { NavAnchor } from "@/components/nav-anchor";
import { compactLinks, darkCell, darkCellRule } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * What the shortcut grid narrows down to once the small-screen bar collapses:
 * one dark row of three cells split by the same hairline the grid uses, so the
 * dividers land between them in both reading directions.
 */
export function CompactBar() {
  const t = useTranslations("nav");

  return (
    <div className="grid grid-cols-3 bg-foreground text-background">
      {compactLinks.map((item, index) => (
        <NavAnchor
          key={item.key}
          item={item}
          className={cn(
            darkCell,
            "h-11",
            index < compactLinks.length - 1 && cn("border-e", darkCellRule),
          )}
        >
          {t(item.key)}
        </NavAnchor>
      ))}
    </div>
  );
}
