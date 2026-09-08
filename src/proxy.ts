import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Locale routing: rewrites/redirects requests so every page is served under
 * "/en" or "/ar" — "/" redirects to the default locale.
 */
export const proxy = createMiddleware(routing);

export const config = {
  // Match everything except API routes, Next.js internals and static files.
  matcher: "/((?!api|_next|_vercel|.*\..*).*)",
};
