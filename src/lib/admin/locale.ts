import "server-only";

import { cookies } from "next/headers";

import {
  ADMIN_LOCALE_COOKIE,
  DEFAULT_ADMIN_LOCALE,
  isAdminLocale,
  type AdminLocale,
} from "@/lib/admin/i18n";

/**
 * The interface language for this request, from the cookie the toggle writes.
 *
 * Reading it on the server is the point: the layout can then put the right
 * `lang` and `dir` on <html> in the first response, so an Arabic dashboard
 * never paints left-to-right in English before correcting itself.
 */
export async function readAdminLocale(): Promise<AdminLocale> {
  const value = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;

  return isAdminLocale(value) ? value : DEFAULT_ADMIN_LOCALE;
}
