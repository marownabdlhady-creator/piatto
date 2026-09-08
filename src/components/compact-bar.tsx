"use client";

import { useTranslations } from "next-intl";

import { compactLinks, darkCell, darkCellRule } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * What the shortcut grid narrows down to once the small-screen bar collapses:
 * one dark row of two cells split by the same hairline the grid uses, so the
 * divider lands between them in both reading directions.
 */
export function CompactBar() {
  const t = useTranslations("nav");

  return (
    <div className="grid grid-cols-2 bg-foreground text-background">
      {compactLinks.map((item, index) => (
        <a
          key={item.key}
          href={item.href}
          className={cn(
            darkCell,
            "h-11",
            index === 0 && cn("border-e", darkCellRule),
          )}
        >
          {t(item.key)}
        </a>
      ))}
    </div>
  );
}
