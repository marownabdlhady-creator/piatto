import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";

import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const credentials = z.object({
  // Addresses are stored folded to lower case, so sign-in is not case
  // sensitive in the half of the pair that isn't a secret.
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

/**
 * Every rejection says the same thing. Which half of the pair was wrong, and
 * whether the address exists at all, are both worth keeping to ourselves.
 */
const INVALID = { error: "Invalid email or password." };

const BCRYPT_ROUNDS = 12;

let decoy: string | undefined;

/**
 * Something to compare against when no admin matches, so a request for an
 * address that does not exist costs the same as a wrong password and the two
 * cannot be told apart by timing. It hashes random bytes once per process, so
 * no password can ever match it.
 */
async function decoyHash(): Promise<string> {
  decoy ??= await hash(randomBytes(32).toString("hex"), BCRYPT_ROUNDS);
  return decoy;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const parsed = credentials.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(INVALID, { status: 401 });
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  const correct = await compare(
    password,
    admin?.passwordHash ?? (await decoyHash()),
  );

  if (!admin || !correct) {
    return NextResponse.json(INVALID, { status: 401 });
  }

  const token = await createSessionToken({ id: admin.id, email: admin.email });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

  return response;
}
