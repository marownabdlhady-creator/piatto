import "server-only";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getAdminSession } from "@/lib/auth";

/**
 * The pieces every admin API route repeats: prove there is a session, read the
 * body, and answer every failure in one shape.
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

/**
 * Prisma failures that are really about the request rather than the server, so
 * the editor can say something true instead of "server error".
 */
function knownFailure(
  error: unknown,
): { message: string; status: number } | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;

  switch (error.code) {
    case "P2025":
      return { message: "That row no longer exists.", status: 404 };
    case "P2003":
      return { message: "That section no longer exists.", status: 404 };
    case "P2002":
      return { message: "That would duplicate an existing row.", status: 409 };
    default:
      return { message: `Database rejected the write (${error.code}).`, status: 400 };
  }
}

/**
 * Runs a route's body and turns anything thrown into an answer the editor can
 * show.
 *
 * The dashboard is one authenticated person editing their own restaurant's
 * menu, and a save that fails silently is worse than useless to them — so the
 * real message comes back rather than a blanket apology, and the whole error,
 * stack included, goes to the server log where it can be chased.
 */
export async function handle(
  route: string,
  work: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await work();
  } catch (error) {
    console.error(`[admin api] ${route} failed:`, error);

    const known = knownFailure(error);
    if (known) return fail(known.message, known.status);

    const detail = error instanceof Error ? error.message : String(error);
    return fail(detail || "Unexpected server error.", 500);
  }
}
