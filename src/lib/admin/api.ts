import "server-only";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";

/**
 * The pieces every admin API route repeats: prove there is a session, read the
 * body, and answer in one shape.
 *
 * The /admin layout already turns strangers away at the door, but a route
 * handler is its own entry point — nothing about being under /api/admin makes
 * a request authenticated. Each route checks for itself.
 */

/** What the editor reads off a failure. */
export type ApiError = { error: string };

export function fail(message: string, status: number): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Null when the caller is signed in, or the 401 to return when they are not.
 * Callers do nothing else until this has come back null.
 */
export async function unauthorized(): Promise<NextResponse<ApiError> | null> {
  const session = await getAdminSession();
  if (session) return null;

  return fail("Not signed in.", 401);
}

/** The parsed JSON body, or the 400 to return when there isn't one. */
export async function readJson(
  request: Request,
): Promise<{ body: unknown } | { response: NextResponse<ApiError> }> {
  try {
    return { body: await request.json() };
  } catch {
    return { response: fail("Expected a JSON body.", 400) };
  }
}
