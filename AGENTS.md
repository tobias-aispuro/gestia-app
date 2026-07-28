<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Gastia — contexto del proyecto

Control de gastos personales. El documento de planificación completo (visión de producto, modelo de datos, requerimientos funcionales/no funcionales, decisiones de UI/UX) vive en `docs/ARCHITECTURE.md` y se commitea junto con el código.

## Stack real

- Next.js 16.2.12 (App Router), React 19.2.4, TypeScript estricto
- Prisma 7.9 con `@prisma/adapter-pg` (driver adapter; el datasource clásico con `env()` no se usa — la URL se inyecta en `prisma.config.ts`). Cliente generado en `src/generated/prisma` (gitignored, se regenera con `npm run db:generate` / `postinstall`)
- Zod 4 para validación de inputs
- Tailwind CSS v4 sin config JS — tokens de diseño en `src/app/globals.css` vía `@theme`/`@theme inline`
- Clerk, Supabase Storage y Recharts están en el plan de `ARCHITECTURE.md` pero **no instalados todavía**

## Estado actual (lo que hay vs. lo que se planeó)

- **Sin autenticación.** No hay Clerk ni rutas `(auth)`. El nombre "tobias" está hardcodeado en `src/app/page.tsx`.
- **Sin API routes ni Server Actions.** `src/app/api` no existe.
- **La UI corre 100% sobre `src/lib/mock-data.ts`**, compartido entre `/` y `/gastos`. Las capas `services/` y `repositories/` ya están escritas y funcionales pero todavía nada las invoca desde la UI.
- **La base de datos ya está migrada** contra Neon (`prisma/migrations/`, tablas `User`/`Category`/`Expense` creadas y vacías). Falta `prisma/seed.ts` — `prisma.config.ts` y el script `db:seed` ya lo referencian pero el archivo no existe todavía.
- Los componentes ya viven en `src/components` (`ui/`, `dashboard/`, `expenses/`, `layout/`), consistente con `ARCHITECTURE.md`. Lo que todavía no está: los route groups `(dashboard)`/`(auth)` y el renombre de rutas a inglés (`/gastos` sigue siendo `/gastos`, no `/expenses`) — eso implicaría construir auth/categorías/reportes que aún no existen, así que se dejó para cuando esas features se implementen.

## Capas y convenciones

- Arquitectura en capas: `repositories/` (única capa que toca Prisma; toda query filtra por `userId`) → `services/` (lógica de negocio, arma `ExpenseView`/`MonthlySummary`, lanza errores de `lib/errors.ts`) → `lib/validators.ts` (Zod, fuente de verdad de todo input de API/Server Action).
- Los montos son `Decimal` en Prisma; se convierten a `number` una sola vez en `expense.service.ts` (`toView`).
- Fechas de columnas `@db.Date` se manejan con `parseDateOnly`/`monthRange` (`lib/utils.ts`) para no correrse de día por zona horaria — todo en UTC.
- Los tipos de dominio (`Category`, `Expense`, `User`) se re-exportan en `src/types/index.ts` desde `@/generated/prisma/models` (Prisma 7 los nombra con sufijo `Model`).
- Alias de import: `@/*` → `src/*`.
- Diseño: dark theme por defecto, tokens custom (`--bg-*`, `--text-*`, `--accent`, etc.) mapeados a utilidades Tailwind. Sidebar: rail lateral en desktop, tab bar inferior en mobile.

## Pendiente conocido

Auth (Clerk), API routes/Server Actions reales, conectar la UI a `services/` en vez de mocks, migraciones + seed, Supabase Storage para tickets, gráficos con Recharts, CRUD de categorías, reportes.
<!-- END:nextjs-agent-rules -->
