"use client";

import type { MouseEventHandler, ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import type { NavLink } from "@/lib/nav";

type NavAnchorProps = {
  item: NavLink;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Value for data-reveal, so the entrance timelines can target the link. */
  reveal?: string;
  children: ReactNode;
};

/**
 * One nav destination, rendered the way its target needs: a page goes through
 * the locale-aware Link so /en and /ar keep their prefix and the route is
 * prefetched, while an in-page anchor stays a plain <a> the browser scrolls to
 * without a navigation. A destination off the site opens in its own tab, so
 * the visit is still here to come back to.
 */
export function NavAnchor({
  item,
  className,
  onClick,
  reveal,
  children,
}: NavAnchorProps) {
  if (item.route) {
    return (
      <Link
        href={item.href}
        onClick={onClick}
        data-reveal={reveal}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      onClick={onClick}
      data-reveal={reveal}
      className={className}
      {...(item.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : null)}
    >
      {children}
    </a>
  );
}
