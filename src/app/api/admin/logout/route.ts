import { NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

/**
 * Drops the session cookie. Written rather than deleted, with the same
 * attributes it was set with and an immediate expiry, so browsers that match
 * cookies on their attributes actually overwrite it.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
