/**
 * Creates the dashboard account, or resets its password if it already exists.
 *
 * Before running this, add to .env (which is gitignored — keep it that way):
 *
 *   ADMIN_EMAIL=you@example.com
 *   ADMIN_PASSWORD=<a long passphrase you have not used elsewhere>
 *   AUTH_SECRET=<32+ random characters, e.g. `openssl rand -base64 32`>
 *
 * Then: npm run admin:create
 *
 * Nothing here has a default. The password is hashed before it goes near the
 * database and is never printed, so the only place it exists in the clear is
 * your .env — clear ADMIN_PASSWORD out of it once the account is made.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

/** Work factor for bcrypt. Matches what the login route compares against. */
const BCRYPT_ROUNDS = 12;

/** Short passwords are the whole attack, so the floor is set here. */
const MIN_PASSWORD_LENGTH = 12;

const environment = z.object({
  DATABASE_URL: z.string("DATABASE_URL is not set.").min(1),
  ADMIN_EMAIL: z.email("ADMIN_EMAIL is not set, or is not an email address."),
  ADMIN_PASSWORD: z
    .string("ADMIN_PASSWORD is not set.")
    .min(
      MIN_PASSWORD_LENGTH,
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    ),
});

async function main() {
  const parsed = environment.safeParse(process.env);

  if (!parsed.success) {
    // Only the messages — never the values that failed.
    for (const issue of parsed.error.issues) {
      console.error(`✗ ${issue.message}`);
    }
    console.error("\nSet these in .env, then run `npm run admin:create`.");
    process.exitCode = 1;
    return;
  }

  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;
  const email = ADMIN_EMAIL.toLowerCase();
  const passwordHash = await hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
  });

  try {
    const existing = await prisma.admin.findUnique({ where: { email } });

    await prisma.admin.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });

    console.log(
      existing
        ? `Password reset for ${email}.`
        : `Admin created for ${email}.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
