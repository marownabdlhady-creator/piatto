import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Locale routing: rewrites/redirects requests so every page is served under
 * "/en" or "/ar" — "/" redirects to the default locale.
 */
export const proxy = createMiddleware(routing);

export const config = {
  // Match everything except the admin area, API routes, Next.js internals and
  // static files. /admin is English-only and lives beside the bilingual site,
  // so sending it through here would only bounce it to "/en/admin".
  matcher: "/((?!admin|api|_next|_vercel|.*\..*).*)",
};
