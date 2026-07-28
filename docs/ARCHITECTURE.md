# 🏗️ Gastia — Arquitectura y Diseño del Sistema

> Documento de planificación y decisiones arquitectónicas.
> Última actualización: 2026-07-26

---

## 1. Visión General

**Gastia** es un sistema web de control de gastos personales mensuales. Permite registrar gastos manualmente, categorizarlos, y visualizar resúmenes mensuales a través de un dashboard.

### Problema que resuelve

El usuario lleva sus gastos en una planilla Excel, anotando manualmente cada compra. Los gastos con tarjeta requieren guardar el ticket físico para transcribirlo después. El sistema digitaliza y simplifica este proceso.

### Usuario principal

Una persona no técnica (~60 años) que necesita una interfaz simple e intuitiva.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Framework** | Next.js (App Router) | Frontend + Backend en un solo proyecto |
| **Lenguaje** | TypeScript | Tipado estático en todo el proyecto |
| **Frontend** | React | Componentes de interfaz |
| **Estilos** | CSS vanilla | Sin dependencias de frameworks CSS |
| **ORM** | Prisma | Acceso type-safe a la base de datos |
| **Base de datos** | PostgreSQL (Neon) | Almacenamiento serverless |
| **Autenticación** | Clerk | Login, sesiones, escalable a multi-usuario |
| **Almacenamiento** | Supabase Storage | Archivos (tickets, imágenes) |
| **Deploy** | Vercel | CI/CD automático, hosting |

---

## 3. Patrón Arquitectónico

### Cliente-Servidor con Monolito Modular

El sistema sigue un patrón **cliente-servidor** donde ambas capas coexisten en un mismo codebase (monolito modular) desplegado en Vercel:

- **Cliente**: Componentes React corriendo en el navegador del usuario
- **Servidor**: API Route Handlers y Server Actions corriendo como funciones serverless en Vercel

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App                        │
│                                                      │
│  ┌──────────────────┐    ┌────────────────────────┐ │
│  │    Client Side    │    │     Server Side        │ │
│  │                   │    │                        │ │
│  │  • React Pages    │◄──►│  • API Route Handlers  │ │
│  │  • Components     │    │  • Server Actions      │ │
│  │  • Hooks          │    │  • Server Components   │ │
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
Presentación (React)  →  API Layer (Route Handlers / Server Actions)
                             ↓
                      Validación (Zod)
                             ↓
                      Services (Lógica de negocio)
                             ↓
                      Repositories (Acceso a datos)
                             ↓
                      Prisma Client → Neon PostgreSQL
```

---

## 4. Estructura de Carpetas

```
gastia-app/
├── docs/                      # Documentación del proyecto
│   └── ARCHITECTURE.md        # Este archivo
├── prisma/
│   ├── schema.prisma          # Modelo de datos
│   ├── migrations/            # Migraciones de BD
│   └── seed.ts                # Datos iniciales (categorías default)
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación (Clerk)
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (dashboard)/       # Rutas protegidas
│   │   │   ├── layout.tsx     # Layout con sidebar/nav
│   │   │   ├── page.tsx       # Dashboard principal
│   │   │   ├── expenses/      # CRUD de gastos
│   │   │   ├── categories/    # Gestión de categorías
│   │   │   └── reports/       # Reportes y gráficos
│   │   ├── api/               # API Route Handlers
│   │   │   ├── expenses/
│   │   │   └── categories/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Componentes React reutilizables
│   │   ├── ui/                # Componentes base (Button, Input, Card, Modal)
│   │   ├── expenses/          # Componentes de dominio
│   │   └── dashboard/         # Widgets del dashboard
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilidades y configuración
│   │   ├── prisma.ts          # Singleton de Prisma
│   │   ├── supabase.ts        # Cliente de Supabase Storage
│   │   ├── validators.ts      # Schemas de Zod
│   │   └── utils.ts           # Funciones auxiliares
│   ├── services/              # Lógica de negocio
│   │   ├── expense.service.ts
│   │   └── category.service.ts
│   ├── repositories/          # Capa de acceso a datos
│   │   ├── expense.repository.ts
│   │   └── category.repository.ts
│   └── types/                 # Tipos TypeScript globales
│       └── index.ts
├── public/                    # Assets estáticos
├── .env.local                 # Variables de entorno (NO commitear)
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

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

## 6. Diseño de API

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/expenses | Crear gasto |
| GET | /api/expenses | Listar gastos (filtros: month, year, category, currency) |
| GET | /api/expenses/:id | Detalle de un gasto |
| PUT | /api/expenses/:id | Editar gasto |
| DELETE | /api/expenses/:id | Eliminar gasto |
| GET | /api/categories | Listar categorías del usuario |
| POST | /api/categories | Crear categoría |
| PUT | /api/categories/:id | Editar categoría |
| DELETE | /api/categories/:id | Eliminar categoría |
| GET | /api/dashboard/summary | Resumen mensual (totales, por categoría) |

### Validación

Todos los inputs se validan con **Zod** antes de llegar a la capa de servicios.

---

## 7. Requerimientos Funcionales

| ID | Requerimiento | Prioridad | Fase |
|----|--------------|-----------|------|
| RF-01 | Registro e inicio de sesión (Clerk) | 🔴 Alta | MVP |
| RF-02 | Crear gasto manualmente (monto, descripción, fecha, categoría, método de pago, moneda) | 🔴 Alta | MVP |
| RF-03 | Listar gastos con filtros (fecha, categoría, moneda, rango de monto) | 🔴 Alta | MVP |
| RF-04 | Editar o eliminar un gasto | 🔴 Alta | MVP |
| RF-05 | Dashboard con resumen mensual (total, por categoría, gráficos) | 🔴 Alta | MVP |
| RF-06 | Gestionar categorías (CRUD) | 🟡 Media | MVP |
| RF-07 | Seleccionar moneda por gasto (ARS / USD) | 🔴 Alta | MVP |
| RF-08 | Escaneo de ticket con cámara + extracción automática | 🟡 Media | Fase 2 |
| RF-09 | Sugerencia automática de categoría al escanear | 🟢 Baja | Fase 2 |
| RF-10 | Ver foto de ticket asociada a un gasto | 🟡 Media | Fase 2 |
| RF-11 | Exportar gastos a CSV/Excel | 🟢 Baja | Fase 2 |
| RF-12 | Presupuestos por categoría con alertas | 🟢 Baja | Fase 3 |
| RF-13 | Comparativo mes a mes | 🟢 Baja | Fase 3 |

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

| Decisión | Elección |
|----------|----------|
| Tema | Dark + Light con toggle |
| Navegación mobile | A definir en fase posterior |
| Navegación desktop | Sidebar |
| Tipografía | Geist (la de Vercel, consistente con el stack) |
| Iconos | Lucide React |
| Gráficos | Recharts |
| Paleta | Tonos neutros con acento en un color primario |

---

## 10. Seguridad

| Aspecto | Solución |
|---------|---------|
| Autenticación | Clerk |
| Autorización | Middleware Next.js + verificación userId en cada query |
| Variables sensibles | .env.local + Vercel Environment Variables |
| HTTPS | Automático en Vercel y Neon |
| Inyección SQL | Prisma (queries parametrizadas) |
| Validación de input | Zod en cada endpoint |

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
