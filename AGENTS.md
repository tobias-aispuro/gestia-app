<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Gastia — contexto del proyecto

Control de gastos personales. El documento de planificación completo (visión de producto, modelo de datos, requerimientos funcionales/no funcionales, decisiones de UI/UX) vive en `docs/ARCHITECTURE.md` — **está en `.gitignore`, no se commitea** (decisión del usuario: lo tiene en dos máquinas y prefiere no versionarlo). Si lo editás, avisale que lo sincronice a mano en la otra compu.

## Stack real

- Next.js 16.2.12 (App Router), React 19.2.4, TypeScript estricto
- Prisma 7.9 con `@prisma/adapter-pg` (driver adapter; el datasource clásico con `env()` no se usa — la URL se inyecta en `prisma.config.ts`). Cliente generado en `src/generated/prisma` (gitignored, se regenera con `npm run db:generate` / `postinstall`)
- Clerk 7.6 (`@clerk/nextjs`) para autenticación — **funcionando de punta a punta**, no solo planeado
- Zod 4 para validación de inputs
- Tailwind CSS v4 sin config JS — tokens de diseño en `src/app/globals.css` vía `@theme`/`@theme inline`
- **No instalados** (están en el plan de `ARCHITECTURE.md`, no en el código): `@clerk/themes` (se probó, su última versión estable sigue atada a `@clerk/shared` v3 y no compila contra `@clerk/nextjs` 7.x — el tema oscuro del login se armó a mano en `appearance` de `ClerkProvider`), Supabase Storage, y Recharts — los gráficos son propios (`EvolutionChart.tsx` con divs, `CategoryBreakdown.tsx` con SVG/`stroke-dasharray`)

## Estado actual

- **Auth funcionando de punta a punta.** `src/proxy.ts` (Next.js 16 renombró `middleware` a `proxy`) envuelve el request con `clerkMiddleware()` sin lógica de protección adentro — Clerk deprecó `createRouteMatcher` + protección centralizada a favor de "resource-based auth checks", así que el guard real vive en `(dashboard)/layout.tsx` (`auth()` + `redirect("/sign-in")`). Sign-in/sign-up en `(auth)/`, con tema oscuro propio. `UserButton` en el Sidebar y un botón de cerrar sesión dedicado en `/perfil`.
- **Alta de usuario lazy, sin seed script.** `src/lib/auth.ts` crea la fila `User` en el primer login de un `clerkId` nuevo y le siembra `DEFAULT_CATEGORIES` (`category.service.ts`). No existe `prisma/seed.ts` ni el script `db:seed`: existió brevemente para un usuario de desarrollo fijo, se borró cuando Clerk empezó a aprovisionar de verdad. `currentUser()` de Clerk solo se llama en esa alta y en `/perfil` — es notablemente más lento que una query a Neon (~0.27s medido), así que el resto (nombre para el saludo del home, etc.) sale de nuestra propia tabla vía `getCurrentUserName()`.
- **La UI corre sobre datos reales.** No queda nada de `mock-data.ts`. Mutaciones por Server Actions (`src/actions/expense.actions.ts`), que revalidan `/` y `/gastos`. `src/app/api` no existe y por ahora no hace falta — ver sección "API" en `ARCHITECTURE.md` (histórica) para la decisión completa.
- **Base migrada** contra Neon (`prisma/migrations/20260728170424_init`).
- **Rutas en castellano**, dentro de los route groups `(auth)` y `(dashboard)`: home (`/`), `/gastos`, `/perfil`. `ARCHITECTURE.md` las planeaba en inglés (`/expenses`); se mantuvo el castellano. El Sidebar linkea a `/categorias` y `/config`, pero esas páginas **no existen todavía** (404) — no confundir con features implementadas.
- **`/gastos` filtra de verdad** por moneda y categoría vía `searchParams` (`?currency=ARS&categoryId=...`), con `FilterPills` leyendo/escribiendo la URL (`useSearchParams`/`useRouter`, no estado local). Filtros de fecha y rango de monto existen en `ListExpensesFilters`/el repositorio pero no tienen control en la UI.
- **El dashboard (`/`) sigue clavado en `Currency.ARS`.** Un gasto en USD no aparece en el resumen del home. `FinanceSummary` muestra balance e ingresos en 0 porque no hay modelo `Income` en la base, solo `Expense` — es una decisión de producto pendiente, no un bug (ver "Pendiente conocido").
- **Performance del home:** la página está partida en `<Suspense>` — el header (categorías + gastos + nombre) se espera directo, pero "Balance/Distribución" (`monthlySummary`) y "Evolución" (`recentMonthlyTotals`) son Server Components async independientes, cada uno con su propio fallback, para no bloquear toda la página por la query más lenta. `recentMonthlyTotals` pasó de 12 queries (una `monthlySummary` por cada uno de 6 meses) a 1 sola query de rango + agrupado en JS.

## Capas y convenciones

- Flujo completo: `proxy.ts` → guard en `(dashboard)/layout.tsx` → page (server component) → `lib/auth.ts` (`getCurrentUserId`/`getCurrentUserName`) → `services/` → `repositories/` → Prisma → Neon. Las escrituras entran por `actions/`.
- Arquitectura en capas: `repositories/` (única capa que toca Prisma; toda query filtra por `userId`) → `services/` (lógica de negocio, arma `ExpenseView`/`MonthlySummary`, lanza errores de `lib/errors.ts`) → `lib/validators.ts` (Zod, fuente de verdad de todo input de Server Action).
- Para editar o borrar filtrando por dueño se usa `updateMany`/`deleteMany`, no `update`/`delete`: son los únicos que aceptan `userId` en el `where` junto al `id`.
- `cache()` de React deduplica queries dentro de un mismo request: `getCurrentDbUser` (interno a `lib/auth.ts`, de ahí salen `getCurrentUserId`/`getCurrentUserName`), `category.repository.findAllByUser` y `expense.service.monthlySummary` — este último lo piden dos secciones distintas del home (`FinanceSummarySection` y `SpendingBreakdownSection`). Si agregás un call site que repita una query ya cacheada, no la dupliques; envolvela.
- Las páginas llevan `export const dynamic = "force-dynamic"`: Prisma no es `fetch`, así que Next no detecta la data como dinámica y las prerenderizaría estáticas (se detectó corriendo `npm run build` y viendo `○ Static` donde debía decir `ƒ Dynamic`).
- **Gotcha de `Modal.tsx`:** el `useEffect` que enfoca el primer elemento al abrir y engancha el listener de `Escape`/Tab-trap NO debe depender de `onClose` en su array de dependencias — si el caller no memoiza su `close()` (algo común en un componente con `useState` por cada tecla, ej. un input de monto controlado), el efecto se re-dispara en cada render y roba el foco de vuelta al botón de cerrar. Se resolvió con un `ref` (`onCloseRef`) sincronizado en un efecto aparte, no como dependencia. Cualquier modal nuevo hereda el fix gratis; si se toca `Modal.tsx`, no reintroducir `onClose` en ese array.
- **Parseo de montos** (`AddExpenseModal.tsx`, `parseAmountInput`): no asume de entrada cuál separador es el decimal. Si aparecen coma y punto, el que está más a la derecha es el decimal. Si aparece uno solo con exactamente 3 dígitos después, es de miles (nadie escribe 3 decimales de moneda); si no, es decimal. Cubre "1.500,50" (AR), "1,500.50" (US), "1,500" (miles) y "1500,50" (decimal) sin ambigüedad.
- Los montos son `Decimal` en Prisma; se convierten a `number` una sola vez en `expense.service.ts` (`toView`).
- Fechas de columnas `@db.Date` se manejan con `parseDateOnly`/`monthRange` (`lib/utils.ts`) para no correrse de día por zona horaria — todo en UTC.
- Los tipos de dominio (`Category`, `Expense`, `User`) se re-exportan en `src/types/index.ts` desde `@/generated/prisma/models` (Prisma 7 los nombra con sufijo `Model`).
- Alias de import: `@/*` → `src/*`.
- Componentes en `src/components`: `ui/` (con barrel en `index.ts`), `dashboard/`, `expenses/`, `layout/` (Sidebar, SignOutButton). Los botones de ícono solo (cruz de cerrar modal, `IconButton`) usan `rounded-full` para que el hover/focus quede circular, no cuadrado.
- Diseño: dark theme único (sin toggle, a diferencia del plan original), tokens custom (`--bg-*`, `--text-*`, `--accent`, etc.) mapeados a utilidades Tailwind. Sidebar: rail lateral expandido (ícono + etiqueta) en desktop, tab bar inferior en mobile.

## Pendiente conocido

- **CRUD de categorías (el gap más grande)**: hoy solo existen las 7 default que se siembran al alta. El Sidebar linkea a `/categorias`, la página no existe. Bloquea, de paso: "+ Nueva categoría" en `AddExpenseModal` (hoy solo visual, el submit la rechaza si la elegís) y `category.actions.ts` (no existe todavía, mismo patrón que `expense.actions.ts`).
- Selector de moneda en el dashboard (`/`, hoy clavado en ARS).
- Modelo de ingresos (`Income`) — decisión de producto sin tomar, no estaba en el RF original.
- Filtros de fecha y rango de monto en `/gastos` (el repositorio ya los soporta, falta la UI).
- Reportes, Supabase Storage para tickets, escaneo de tickets, exportar CSV, presupuestos, comparativo mensual — todo Fase 2/3 de `ARCHITECTURE.md`, sin arrancar.
- Deploy a Vercel — no se hizo todavía, el proyecto solo corrió en local/dev.
<!-- END:nextjs-agent-rules -->
