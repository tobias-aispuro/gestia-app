<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Gastia — contexto del proyecto

Control de gastos personales. El documento de planificación completo (visión de producto, modelo de datos, requerimientos funcionales/no funcionales, decisiones de UI/UX) vive en `docs/ARCHITECTURE.md` y se commitea junto con el código.

## Stack real

- Next.js 16.2.12 (App Router), React 19.2.4, TypeScript estricto
- Prisma 7.9 con `@prisma/adapter-pg` (driver adapter; el datasource clásico con `env()` no se usa — la URL se inyecta en `prisma.config.ts`). Cliente generado en `src/generated/prisma` (gitignored, se regenera con `npm run db:generate` / `postinstall`)
- Clerk 7.6 (`@clerk/nextjs`) para autenticación
- Zod 4 para validación de inputs
- Tailwind CSS v4 sin config JS — tokens de diseño en `src/app/globals.css` vía `@theme`/`@theme inline`
- **No instalados** (están en el plan de `ARCHITECTURE.md`): Supabase Storage para tickets, y Recharts — el gráfico de evolución es propio (`EvolutionChart.tsx`, barras en divs), no hay librería de charts

## Estado actual

- **Auth funcionando.** `src/proxy.ts` envuelve el request con `clerkMiddleware()` — Next.js 16 renombró `middleware` a `proxy`, y Clerk deprecó `createRouteMatcher` a favor de chequeos por recurso, así que el guard real vive en `(dashboard)/layout.tsx` (`auth()` + `redirect("/sign-in")`).
- **Alta de usuario lazy, sin seed script.** `src/lib/auth.ts` crea la fila `User` en el primer login de un `clerkId` nuevo y le siembra `DEFAULT_CATEGORIES` (`category.service.ts`). No existe `prisma/seed.ts` ni el script `db:seed`: fue una decisión, no un pendiente. `currentUser()` de Clerk solo se llama en ese primer alta y en `/perfil` — es notablemente más lento que una query a Neon, así que el resto sale de nuestra propia tabla.
- **La UI corre sobre datos reales.** No queda nada de `mock-data.ts`.
- **Mutaciones por Server Actions** (`src/actions/expense.actions.ts`), que revalidan `/` y `/gastos`. `src/app/api` no existe y por ahora no hace falta.
- **Base migrada** contra Neon (`prisma/migrations/20260728170424_init`).
- **Rutas en castellano**, dentro de los route groups `(auth)` y `(dashboard)`: home (`/`), `/gastos`, `/perfil`. `ARCHITECTURE.md` las planeaba en inglés (`/expenses`); se mantuvo el castellano.
- **El dashboard está clavado en `Currency.ARS`.** `/gastos` sí permite filtrar por moneda vía `searchParams`, pero el home no: un gasto en USD no aparece en el resumen. `FinanceSummary` muestra balance e ingresos en 0 porque no hay modelo `Income` en la base, solo `Expense`.

## Capas y convenciones

- Flujo completo: `proxy.ts` → guard en `(dashboard)/layout.tsx` → page (server component) → `lib/auth.ts` (`getCurrentUserId`) → `services/` → `repositories/` → Prisma → Neon. Las escrituras entran por `actions/`.
- Arquitectura en capas: `repositories/` (única capa que toca Prisma; toda query filtra por `userId`) → `services/` (lógica de negocio, arma `ExpenseView`/`MonthlySummary`, lanza errores de `lib/errors.ts`) → `lib/validators.ts` (Zod, fuente de verdad de todo input de Server Action).
- Para editar o borrar filtrando por dueño se usa `updateMany`/`deleteMany`, no `update`/`delete`: son los únicos que aceptan `userId` en el `where` junto al `id`.
- `cache()` de React deduplica queries dentro de un mismo request: `getCurrentDbUser` (`lib/auth.ts`), `category.repository.findAllByUser` y `expense.service.monthlySummary` — este último lo piden dos secciones distintas del home. Si agregás un call site que repita una query ya cacheada, no la dupliques.
- Las páginas llevan `export const dynamic = "force-dynamic"`: Prisma no es `fetch`, así que Next no detecta la data como dinámica y las prerenderizaría estáticas.
- Los montos son `Decimal` en Prisma; se convierten a `number` una sola vez en `expense.service.ts` (`toView`).
- Fechas de columnas `@db.Date` se manejan con `parseDateOnly`/`monthRange` (`lib/utils.ts`) para no correrse de día por zona horaria — todo en UTC.
- Los tipos de dominio (`Category`, `Expense`, `User`) se re-exportan en `src/types/index.ts` desde `@/generated/prisma/models` (Prisma 7 los nombra con sufijo `Model`).
- Alias de import: `@/*` → `src/*`.
- Componentes en `src/components`: `ui/` (con barrel en `index.ts`), `dashboard/`, `expenses/`, `layout/`.
- Diseño: dark theme por defecto, tokens custom (`--bg-*`, `--text-*`, `--accent`, etc.) mapeados a utilidades Tailwind. Sidebar: rail lateral en desktop, tab bar inferior en mobile.

## Pendiente conocido

CRUD de categorías (hoy solo existen las default que se siembran al alta), moneda seleccionable en el dashboard, modelo de ingresos, reportes, Supabase Storage para tickets, escaneo de tickets.
<!-- END:nextjs-agent-rules -->
