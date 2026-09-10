import { existsSync } from "node:fs";

import { defineConfig, env } from "prisma/config";

// Next loads .env for the app itself, but the Prisma CLI runs outside it, so
// the connection string has to be pulled in here before `env()` looks for it.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
