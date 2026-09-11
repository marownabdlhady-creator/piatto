import { existsSync } from "node:fs";

import { defineConfig } from "prisma/config";

// Next loads .env for the app itself, but the Prisma CLI runs outside it, so
// the connection string has to be pulled in here before it is read below.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

// `generate` reads the schema and nothing else, but on Vercel it runs from
// `postinstall`, where the project's environment variables are not in scope.
// Prisma's `env()` helper throws the moment this module is evaluated, so a
// missing URL failed the whole install over a value that command never asked
// for — and the message blamed TypeScript, because the loader reports any
// error thrown out of this file as a failure to load it.
//
// So the datasource is attached only when there is one to attach. The commands
// that genuinely need it — migrate, db push, seed, studio — still get it, and
// still only from the environment; if it is missing there, Prisma says so
// itself when one of them runs.
const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: url ? { url } : undefined,
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
