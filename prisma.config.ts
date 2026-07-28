import { config } from "dotenv";
// Next.js lee .env.local solo; Prisma 7 ya no carga ningún .env por su cuenta,
// así que lo cargamos acá para tener una única fuente de variables.
config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // No usamos env() de prisma/config: tira error si la variable falta, y eso
    // rompe `prisma generate` en builds donde solo hace falta el cliente.
    url: process.env["DATABASE_URL"],
  },
});
