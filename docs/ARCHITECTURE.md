# 🏗️ Gastia — Arquitectura y Diseño del Sistema

> Documento de planificación y decisiones arquitectónicas.
> Última actualización: 2026-07-28 — refleja lo implementado, no solo lo planeado. Las secciones 3, 4, 6, 7, 9 y 10 se reescribieron tras conectar Clerk, Server Actions y los datos reales; donde el plan original y la implementación difieren, se aclara explícitamente.

---

## 1. Visión General

**Gastia** es un sistema web de control de gastos personales mensuales. Permite registrar gastos manualmente, categorizarlos, y visualizar resúmenes mensuales a través de un dashboard.

### Problema que resuelve

El usuario lleva sus gastos en una planilla Excel, anotando manualmente cada compra. Los gastos con tarjeta requieren guardar el ticket físico para transcribirlo después. El sistema digitaliza y simplifica este proceso.

### Usuario principal

Una persona no técnica (~60 años) que necesita una interfaz simple e intuitiva.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Propósito | Estado |
|------|-----------|-----------|--------|
| **Framework** | Next.js 16 (App Router) | Frontend + Backend en un solo proyecto | ✅ Implementado — ver nota abajo sobre `proxy` |
| **Lenguaje** | TypeScript (estricto) | Tipado estático en todo el proyecto | ✅ |
| **Frontend** | React 19 | Componentes de interfaz | ✅ |
| **Estilos** | Tailwind CSS v4 (sin config JS) | Tokens de diseño en `globals.css` vía `@theme` | ✅ Implementado — el plan original decía "CSS vanilla", se optó por Tailwind |
| **ORM** | Prisma 7 con `@prisma/adapter-pg` | Acceso type-safe a la base de datos | ✅ Driver adapter, no el datasource clásico — la URL vive en `prisma.config.ts` |
| **Base de datos** | PostgreSQL (Neon) | Almacenamiento serverless | ✅ Migrada y en uso |
| **Autenticación** | Clerk | Login, sesiones, multi-usuario | ✅ Implementado — sign-in/sign-up, alta lazy de `User` + categorías default en el primer login |
| **Almacenamiento** | Supabase Storage | Archivos (tickets, imágenes) | ⏳ Planeado, no instalado |
| **Deploy** | Vercel | CI/CD automático, hosting | ⏳ Planeado, no desplegado todavía |

> Next.js 16 renombró el archivo de middleware a **`proxy`**: la app usa `src/proxy.ts` (no `middleware.ts`). La funcionalidad es la misma, solo cambió la convención de nombre.

---

## 3. Patrón Arquitectónico

### Cliente-Servidor con Monolito Modular

El sistema sigue un patrón **cliente-servidor** donde ambas capas coexisten en un mismo codebase (monolito modular) desplegado en Vercel.

**Decisión implementada: sin API Route Handlers.** El plan original consideraba `src/app/api/` con endpoints REST (ver sección 6 histórica). En la práctica, todas las lecturas se resuelven con **Server Components async** que llaman directo a `services/`, y todas las escrituras con **Server Actions** (`src/actions/`). No hay ni un solo Route Handler en el proyecto — para una app de un único cliente (esta misma UI, sin consumidores externos de una API), sumar una capa REST no aportaba nada y sí una traducción extra entre `services/` y HTTP.

- **Cliente**: Componentes React (la mayoría Server Components; los que necesitan estado/interacción son `"use client"`)
- **Servidor**: Server Actions + Server Components corriendo como funciones serverless en Vercel

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App                        │
│                                                      │
│  ┌──────────────────┐    ┌────────────────────────┐ │
│  │    Client Side    │    │     Server Side        │ │
│  │                   │    │                        │ │
│  │  • Client Comps   │◄──►│  • Server Actions      │ │
│  │    ("use client") │    │  • Server Components   │ │
│  │  • Client State   │    │  • Services Layer      │ │
│  │                   │    │  • Repositories        │ │
│  └──────────────────┘    └──────────┬─────────────┘ │
│                                      │               │
└──────────────────────────────────────┼───────────────┘
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                     ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
                     │  Neon   │ │ Clerk   │ │Supabase │
                     │Postgres │ │  Auth   │ │ Storage │
                     └─────────┘ └─────────┘ └─────────┘
```

### ¿Por qué monolito modular?

- **Complejidad baja**: un solo deploy, un solo repo
- **Costo cero**: todo corre en el free tier de Vercel
- **Equipo pequeño**: 1-2 desarrolladores
- **Migración futura**: la modularidad interna permite extraer servicios si escala

### Separación de capas internas

```
Presentación (React)  →  Server Actions (mutaciones) / Server Components (lecturas)
                             ↓
                      Validación (Zod, solo en mutaciones)
                             ↓
                      Services (Lógica de negocio)
                             ↓
                      Repositories (Acceso a datos, única capa que toca Prisma)
                             ↓
                      Prisma Client → Neon PostgreSQL
```

Las lecturas (`services/*.list`, `*.monthlySummary`, etc.) no pasan por Zod — no hay input de usuario que validar, solo `userId` (que sale de la sesión de Clerk, no de un form) y filtros opcionales ya tipados. La validación con Zod aplica a las Server Actions, que sí reciben datos escritos por el usuario.

**Deduplicación de queries:** varias secciones de una misma página piden el mismo dato (ej. `FinanceSummarySection` y `SpendingBreakdownSection` en la home ambas necesitan `monthlySummary`). En vez de levantar ese dato en un ancestro común y pasarlo por props — lo que forzaría a esperar la query más lenta antes de renderizar nada —, las funciones se envuelven con `cache()` de React (`getCurrentUserId`, `category.repository.findAllByUser`, `expense.service.monthlySummary`): cada una se ejecuta una sola vez por request sin importar cuántos componentes la llamen, y cada sección puede tener su propio `<Suspense>` y aparecer en pantalla apenas su propio dato está listo, sin esperar a las demás.

---

## 4. Estructura de Carpetas

Estructura real del proyecto, no la planeada originalmente. Los cambios más importantes respecto al plan: `src/actions/` reemplaza a `src/app/api/` (sección 3), `src/proxy.ts` reemplaza a `middleware.ts` (convención de Next 16), y `(dashboard)/expenses`, `categories` y `reports` del plan quedaron como `(dashboard)/gastos` y `(dashboard)/perfil` — `/categorias` y `/reports` todavía no existen (ver sección 7, RF-06 pendiente).

```
gastia-app/
├── docs/
│   └── ARCHITECTURE.md
├── prisma/
│   ├── schema.prisma           # Modelo de datos
│   └── migrations/             # Migraciones de BD
├── src/
│   ├── proxy.ts                # Auth de Clerk a nivel de request (antes "middleware.ts")
│   ├── actions/                # Server Actions — toda mutación entra por acá
│   │   └── expense.actions.ts
│   ├── app/
│   │   ├── layout.tsx          # Root layout: fonts + <ClerkProvider>, nada más
│   │   ├── globals.css         # Tokens de diseño (Tailwind v4 @theme)
│   │   ├── (auth)/             # Rutas públicas
│   │   │   ├── layout.tsx      # Layout centrado, sin sidebar
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   └── (dashboard)/        # Rutas protegidas
│   │       ├── layout.tsx      # Sidebar + guard: auth() y redirect si no hay sesión
│   │       ├── page.tsx        # Dashboard principal (Server Component + Suspense)
│   │       ├── gastos/page.tsx # Listado + filtros por querystring
│   │       └── perfil/page.tsx # Datos de Clerk + botón de cerrar sesión
│   ├── components/
│   │   ├── ui/                 # Componentes base (Button, Input, Card, Modal...)
│   │   ├── expenses/           # Componentes de dominio (modales, lista, filtros)
│   │   ├── dashboard/          # Widgets del dashboard (resumen, gráficos)
│   │   └── layout/             # Sidebar, SignOutButton
│   ├── lib/
│   │   ├── prisma.ts           # Singleton de Prisma (driver adapter @prisma/adapter-pg)
│   │   ├── auth.ts             # getCurrentUserId/getCurrentUserName (Clerk + alta lazy)
│   │   ├── errors.ts           # Errores de dominio (NotFoundError, etc.)
│   │   ├── validators.ts       # Schemas de Zod
│   │   └── utils.ts            # Funciones auxiliares (formatAmount, parseDateOnly...)
│   ├── services/                # Lógica de negocio
│   │   ├── expense.service.ts
│   │   └── category.service.ts
│   ├── repositories/            # Única capa que toca Prisma; todo filtra por userId
│   │   ├── expense.repository.ts
│   │   └── category.repository.ts
│   ├── generated/prisma/        # Cliente de Prisma generado (gitignored)
│   └── types/                   # Tipos TypeScript globales
│       └── index.ts
├── public/                     # Assets estáticos
├── .env.local                  # Variables de entorno (gitignored)
├── prisma.config.ts             # URL de conexión (Prisma 7 la sacó del datasource)
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

**No existen todavía** (a diferencia del plan original): `src/hooks/` (no hizo falta ningún hook custom), `src/lib/supabase.ts` (Supabase no está instalado), `prisma/seed.ts` (existió brevemente para un usuario de desarrollo fijo; se borró cuando Clerk empezó a crear el `User` real + categorías default automáticamente en el primer login — ver `getCurrentUserId` en `lib/auth.ts`).

---

## 5. Modelo de Datos

### Diagrama Entidad-Relación

```
USER ||--o{ EXPENSE : "tiene"
USER ||--o{ CATEGORY : "define"
CATEGORY ||--o{ EXPENSE : "clasifica"
```

### Entidades

#### User
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | String | PK, cuid | Identificador interno |
| clerkId | String | Unique | ID de Clerk para vincular auth |
| name | String? | — | Nombre del usuario |
| email | String | Unique | Email del usuario |
| createdAt | DateTime | Default now | Fecha de creación |
| updatedAt | DateTime | Auto | Fecha de última modificación |

#### Category
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | String | PK, cuid | Identificador |
| name | String | — | Nombre de la categoría |
| icon | String? | — | Emoji o identificador de ícono |
| color | String? | — | Color hex para UI |
| isDefault | Boolean | Default false | Si es categoría preconfigurada |
| userId | String | FK → User | Propietario |
| createdAt | DateTime | Default now | Fecha de creación |

#### Expense
| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | String | PK, cuid | Identificador |
| amount | Decimal(12,2) | — | Monto del gasto |
| currency | Enum (ARS, USD) | Default ARS | Moneda del gasto |
| description | String | — | Descripción del gasto |
| date | DateTime | — | Fecha en que se realizó el gasto |
| categoryId | String | FK → Category | Categoría asignada |
| userId | String | FK → User | Propietario |
| ticketUrl | String? | — | URL de la foto del ticket (Supabase) |
| merchant | String? | — | Nombre del comercio |
| paymentMethod | Enum | Default CASH | Método de pago |
| createdAt | DateTime | Default now | Fecha de creación |
| updatedAt | DateTime | Auto | Fecha de última modificación |

#### Enums

```
PaymentMethod: CASH | DEBIT_CARD | CREDIT_CARD | TRANSFER
Currency: ARS | USD
```

### Decisiones de diseño del modelo

| Decisión | Opción elegida | Alternativa descartada | Razón |
|----------|---------------|----------------------|-------|
| ID | cuid() | UUID / autoincrement | Más corto que UUID, no predecible como autoincrement |
| Montos | Decimal(12,2) | Float / Integer (centavos) | Decimal evita errores de punto flotante |
| Moneda | Enum en Expense | Tabla Currency separada | Solo 2 monedas (ARS, USD), enum es suficiente |
| Categorías | Por usuario con defaults | Globales fijas | Personalización con categorías preconfiguradas |
| Método de pago | Enum | Tabla separada | Suficiente para el caso de uso |
| Soft delete | No | Sí | Un usuario, datos personales. Se puede agregar después |
| Ticket | URL a Supabase Storage | Blob en BD | Imágenes no van en la BD |

---

## 6. Diseño de la capa de datos

No hay API REST (ver decisión en sección 3). Las lecturas son llamadas directas a `services/` desde Server Components; las escrituras son Server Actions.

### Server Actions implementadas

| Action | Archivo | Descripción |
|--------|---------|-------------|
| `createExpenseAction(input)` | `actions/expense.actions.ts` | Crea un gasto, revalida `/` y `/gastos` |
| `updateExpenseAction(id, input)` | `actions/expense.actions.ts` | Edita un gasto, revalida `/` y `/gastos` |
| `deleteExpenseAction(id)` | `actions/expense.actions.ts` | Borra un gasto, revalida `/` y `/gastos` |

Pendiente (bloqueado por RF-06, categorías CRUD): `category.actions.ts` con el mismo patrón.

### Lecturas (sin Action — llamadas directas desde Server Components)

| Función | Uso |
|---------|-----|
| `expenseService.list(userId, filters)` | Listado de `/gastos`, con filtros de moneda/categoría por querystring |
| `expenseService.monthlySummary(userId, year, month, currency)` | Resumen del mes para el dashboard (RF-05) |
| `expenseService.recentMonthlyTotals(userId, currency, months)` | Serie de últimos N meses para el gráfico de evolución |
| `categoryService.list(userId)` | Categorías del usuario (selects, filtros) |

### Validación

Todo input que llega por una **Server Action** se valida con **Zod** (`lib/validators.ts`) antes de tocar `services/`. Las lecturas no pasan por Zod: no hay body de usuario que validar, solo `userId` (de la sesión) y filtros ya tipados por TypeScript.

---

## 7. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Fase | Estado |
|----|--------------|-----------|------|--------|
| RF-01 | Registro e inicio de sesión (Clerk) | 🔴 Alta | MVP | ✅ Hecho |
| RF-02 | Crear gasto manualmente (monto, descripción, fecha, categoría, método de pago, moneda) | 🔴 Alta | MVP | ✅ Hecho |
| RF-03 | Listar gastos con filtros (fecha, categoría, moneda, rango de monto) | 🔴 Alta | MVP | 🚧 Parcial — categoría y moneda filtran de verdad (querystring); fecha y rango de monto no tienen control en la UI todavía, aunque el repositorio ya los soporta |
| RF-04 | Editar o eliminar un gasto | 🔴 Alta | MVP | ✅ Hecho |
| RF-05 | Dashboard con resumen mensual (total, por categoría, gráficos) | 🔴 Alta | MVP | ✅ Hecho — gráficos propios (sin Recharts, ver sección 9) |
| RF-06 | Gestionar categorías (CRUD) | 🟡 Media | MVP | ❌ Pendiente — el sidebar linkea a `/categorias`, no existe la página. Solo hay las 7 default que se siembran al alta |
| RF-07 | Seleccionar moneda por gasto (ARS / USD) | 🔴 Alta | MVP | 🚧 Parcial — se elige al crear un gasto; el dashboard (`/`) sigue clavado en ARS |
| RF-08 | Escaneo de ticket con cámara + extracción automática | 🟡 Media | Fase 2 | ❌ Pendiente |
| RF-09 | Sugerencia automática de categoría al escanear | 🟢 Baja | Fase 2 | ❌ Pendiente |
| RF-10 | Ver foto de ticket asociada a un gasto | 🟡 Media | Fase 2 | ❌ Pendiente |
| RF-11 | Exportar gastos a CSV/Excel | 🟢 Baja | Fase 2 | ❌ Pendiente |
| RF-12 | Presupuestos por categoría con alertas | 🟢 Baja | Fase 3 | ❌ Pendiente |
| RF-13 | Comparativo mes a mes | 🟢 Baja | Fase 3 | ❌ Pendiente |

## 8. Requerimientos No Funcionales

| ID | Requerimiento | Detalle |
|----|--------------|---------|
| RNF-01 | Usabilidad | Interfaz intuitiva para usuario no técnico |
| RNF-02 | Responsividad | Funcional en desktop, mobile se optimiza en fase posterior |
| RNF-03 | Performance | Dashboard carga en < 2 segundos |
| RNF-04 | Seguridad | Datos solo accesibles por usuario autenticado |
| RNF-05 | Escalabilidad | Multi-usuario a futuro sin rediseño mayor |
| RNF-06 | Mantenibilidad | Código tipado, capas separadas, principios SOLID |

## 9. Decisiones de UI/UX

| Decisión | Elección | Nota |
|----------|----------|------|
| Tema | Solo dark, sin toggle | El plan original preveía light + toggle; se implementó únicamente el tema oscuro (paleta cálida, `globals.css`) |
| Navegación mobile | Tab bar inferior | Ya definida e implementada — el plan la dejaba "a definir" |
| Navegación desktop | Sidebar (rail expandido con ícono + etiqueta por sección) | |
| Tipografía | Geist (la de Vercel, consistente con el stack) | |
| Iconos | SVG inline a mano, sin librería | El plan preveía Lucide React; no se instaló — cada ícono del Sidebar es un `<svg>` propio, mismo estilo de trazo (`strokeWidth 1.5`) |
| Gráficos | Propios, sin librería | El plan preveía Recharts; no se instaló. `EvolutionChart` son barras en divs, `CategoryBreakdown` es un donut en SVG puro (`stroke-dasharray`) |
| Paleta | Tonos cálidos oscuros con acento dorado | Más específico que "neutros": fondo casi negro (`#111110`), acento `#d4a853` |

---

## 10. Seguridad

| Aspecto | Solución |
|---------|---------|
| Autenticación | Clerk (email + Google OAuth) |
| Autorización | `src/proxy.ts` (antes "middleware", renombrado en Next 16) + guard en `(dashboard)/layout.tsx` (`auth()` y `redirect`) + `userId` verificado en cada query de `repositories/` |
| Variables sensibles | .env.local (gitignored) + Vercel Environment Variables cuando se despliegue |
| HTTPS | Automático en Vercel y Neon |
| Inyección SQL | Prisma (queries parametrizadas) |
| Validación de input | Zod en cada Server Action (no hay endpoints — ver sección 6) |

## 11. Variables de Entorno

```
# Base de datos
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase Storage (cuando se necesite)
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 12. Funcionalidades Futuras (fuera del MVP)

- Escaneo de tickets con IA (Gemini / Claude Vision)
- PWA instalable con soporte offline
- Notificaciones de vencimientos
- Multi-usuario familiar
- Reportes anuales
- Gastos recurrentes automáticos
