import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

/**
 * The dashboard session: a JWT in an httpOnly cookie, signed with a secret
 * from the environment.
 *
 * Setting up a new environment means putting AUTH_SECRET in .env — a long
 * random string, e.g. `openssl rand -base64 32`. There is deliberately no
 * fallback: a hardcoded default secret would let anyone mint a session.
 */

/** Named for the site so it cannot collide with anything else on the host. */
export const SESSION_COOKIE = "piatto_admin_session";

/** A week. Long enough to be convenient, short enough to expire on its own. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Anything shorter is not worth signing with. */
const MIN_SECRET_LENGTH = 32;

const ALGORITHM = "HS256";

/** Who is signed in. Deliberately small — it all travels in the token. */
export type AdminSession = {
  id: string;
  email: string;
};

function authSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Add it to .env.");
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`,
    );
  }

  return new TextEncoder().encode(secret);
}

/** Signs a session token for an admin who has just proved who they are. */
export async function createSessionToken(
  admin: AdminSession,
): Promise<string> {
  return new SignJWT({ email: admin.email })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(authSecret());
}

/**
 * The session a token stands for, or null if it is missing, expired, altered,
 * or signed with anything but our secret.
 */
export async function verifySessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, authSecret(), {
      algorithms: [ALGORITHM],
    });

    const { sub, email } = payload;
    if (typeof sub !== "string" || typeof email !== "string") return null;

    return { id: sub, email };
  } catch {
    // An unreadable token is simply not a session; there is nothing to log
    // that would not be attacker-supplied noise.
    return null;
  }
}

/**
 * How the session cookie is written. `secure` is off in development because
 * localhost is plain HTTP and the cookie would otherwise never be stored.
 *
 * `sameSite: "lax"` keeps the cookie off cross-site POSTs — the shape a CSRF
 * against the dashboard would take — while still surviving a normal click
 * through to /admin from elsewhere.
 */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/** Whoever is signed in on this request, or null. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

/**
 * The session, or a redirect to the login page. For server components and
 * server actions behind /admin that have nothing to render to a stranger.
 *
 * The token is trusted on its signature alone — no row is read to confirm the
 * account still exists — so a deleted admin keeps working until their week is
 * up. With one account that is the right trade, but anything that revokes
 * access will need a check here, or a shorter expiry.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return session;
}
