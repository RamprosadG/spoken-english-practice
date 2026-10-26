<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Guidelines & Project Architecture

## Project Overview
- **Application**: Spoken English Practice
- **Framework**: Next.js 16+ (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict mode)
- **ORM & Database**: Prisma 7 with `@prisma/adapter-pg` and PostgreSQL
- **Styling**: Tailwind CSS v4, `react-icons`, shared UI primitives in `src/components/ui`

The project is currently at the **layout-foundation stage**. The app shell, navigation, three empty pages, UI primitives, and database wiring are in place. Do not add feature content to Home, Presentation, or Practice until a feature step explicitly asks for it.

---

## Directory Conventions & Architecture

```text
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── presentation/page.tsx    # Presentation
│   ├── practice/page.tsx        # Practice
│   ├── api/                     # Route handlers (added with features)
│   ├── layout.tsx               # Root layout: fonts, metadata, AppLayoutShell
│   └── not-found.tsx
├── components/
│   ├── features/                # Server-rendered page sections, one folder per page
│   │   ├── home/
│   │   ├── presentation/
│   │   └── practice/
│   ├── shared/                  # AppLayoutShell, Sidebar, Navbar, Footer
│   └── ui/                      # Generic reusable primitives
├── features/                    # Client islands (forms, modals) — added with features
├── server/
│   ├── services/                # Business workflows, pagination and KPI aggregation
│   ├── repositories/            # Prisma data access; visibility rules live here
│   └── types/                   # Per-domain payload, filter and pagination interfaces
├── types/                       # Client-facing view-model types per feature
└── lib/
    ├── prisma.ts                # PrismaClient singleton (import PrismaClient from '@/generated/prisma/client')
    ├── utils.ts                 # Formatting and pagination helpers
    └── validations/             # Zod schemas — added with features
```

---

## Technical Rules & Best Practices

### 1. Layout & Navigation
- **Single shell**: All pages render inside `AppLayoutShell`. Do not create per-page sidebars or headers.
- **Sidebar state**: `AppLayoutShell` owns the mobile drawer state and passes handlers to `Navbar` and `Sidebar`. Keep it that way unless a cross-tree consumer appears.
- **Header content**: `Navbar` is intentionally empty except for the mobile hamburger. Add header content only when a requirement asks for it.
- **Routes**: Home is `/`; the other pages are `/presentation` and `/practice`. Sidebar active state compares `pathname === href`.
- **Page content**: Pages render a `components/features/<area>/<Area>Header` component. Keep the established page container (`flex flex-col gap-6 w-full`).
- **Layout offsets**: The fixed header height lives in `--app-nav-height`; do not hardcode `pt-16` in the shell.
- **Styling baseline**: Preserve the existing shell classes (`w-64` sidebar, `lg:pl-64`, `p-6 md:p-8`, indigo active state, slate borders). Style changes must be broad and intentional, not incidental to a refactor.

### 2. Prisma & Database
- **Client location**: The Prisma client is generated into `src/generated/prisma`. Always import the singleton from `@/lib/prisma`.
- **Adapter**: Instantiate `PrismaClient` only through `@prisma/adapter-pg` as already wired in `src/lib/prisma.ts`.
- **Primary & foreign keys**: Use `String @id @default(uuid())`. Do not use integer autoincrement IDs.
- **Schema changes**: After editing `prisma/schema.prisma`, run `npx prisma generate` and `npx prisma migrate dev --name <name>`.
- **No seed yet**: There are no models and no seed script. Add a seed only when the first models land, and wire it back into `prisma.config.ts` and `package.json` at that point.
- **Migrations**: Commit `prisma/migrations` alongside schema changes. Do not edit generated SQL after it has been applied.

### 3. Next.js & React 19 Standards
- **Server Components by default**: Add `"use client"` only for state, event handlers, or browser APIs. The shell components are client islands; page components stay server components.
- **Layered backend**: When features arrive, route handlers (`src/app/api/...`) delegate to `src/server/services/` and repositories. Validate inputs with Zod schemas from `src/lib/validations/`.
- **Server-rendered pages**: Feature pages should be Server Components that call their service directly and stream through `<Suspense>`. Keep search, filter, and page state in URL search params — not in client state — so only filter bars, pagination, and modals are client islands.
- **List vs. KPI queries**: Pair each ledger list endpoint with an unfiltered summary endpoint for stat cards. Push search and filters into the Prisma `where` and paginate with `count` + `skip`/`take`.
- **No authentication yet**: There is no auth or role layer. Do not invent one until a requirement defines users and permissions.
- **Request data**: If a page reads `request.url` or search params, await `connection()` before the read so it does not serve a stale prerendered snapshot.

### 4. UI Primitives
- Reuse `src/components/ui` before building new primitives. The library includes `Button`, `Input`, `SearchInput`, `Dropdown`, `Modal`, `DataTable`, `Pagination`, `StatCard`, `Badge`, `TableActionButton`, and the SweetAlert helpers.
- Shared composites belong in `src/components/shared`; page-specific sections belong in `src/components/features/<area>`; client-only forms/modals belong in `src/features/<domain>`.

### 5. Code Quality & Verification
- **Strict TypeScript**: Avoid `any`; use Prisma model types from `@/generated/prisma/client`.
- **Lint**: `npm run lint` must stay at zero errors. The only accepted warning is the deliberate `react-hooks/exhaustive-deps` deviation in `SearchInput.tsx`; keep it documented with a reasoned `eslint-disable` rather than restructuring the effect.
- **Build**: Run `npx tsc --noEmit` and `npm run build` after structural or schema changes. Keep the build clean.
- **Do not delete unrelated files** or restructure directories when adding a feature.
