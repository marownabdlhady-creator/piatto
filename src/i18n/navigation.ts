import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware replacements for the Next.js navigation APIs. Use these instead
 * of the ones from "next/link" and "next/navigation" so the active locale is
 * carried across navigations (and so the language toggle can swap it).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
