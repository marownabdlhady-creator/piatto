"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
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
      {compactLinks.map((item, index) => {
        const className = cn(
          darkCell,
          "h-11",
          index < compactLinks.length - 1 && cn("border-e", darkCellRule),
        );

        return item.route ? (
          <Link key={item.key} href={item.href} className={className}>
            {t(item.key)}
          </Link>
        ) : (
          <a key={item.key} href={item.href} className={className}>
            {t(item.key)}
          </a>
        );
      })}
    </div>
  );
}
