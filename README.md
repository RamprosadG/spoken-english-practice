# Spoken English Practice

A full-stack **Spoken English Practice** application built with **Next.js 16 (App Router & Turbopack)**, **TypeScript**, **Tailwind CSS v4**, **PostgreSQL**, and **Prisma ORM 7** with the `@prisma/adapter-pg` driver.

This repository currently contains the **layout-first foundation**: the application shell, navigation, three portal pages, the shared UI primitives, and the database wiring. Feature screens will be built on top of this foundation in later steps.

---

## 📑 Table of Contents
1. [Current Scope](#1-current-scope)
2. [How to Run Locally](#2-how-to-run-locally)
3. [Environment Variables](#3-environment-variables)
4. [Database Setup](#4-database-setup)
5. [Project Structure](#5-project-structure)
6. [Layout & Navigation](#6-layout--navigation)
7. [Shared UI Primitives](#7-shared-ui-primitives)
8. [Quality Gates](#8-quality-gates)

---

## 1. Current Scope

The application currently ships the shared application shell and three empty portal pages:

| Route | Page | Sidebar Label |
| :--- | :--- | :--- |
| `/` | Home | Home |
| `/presentation` | Presentation | Presentation |
| `/practice` | Practice | Practice |

Each page intentionally renders only its page name inside a bordered page header. The top header is deliberately empty apart from the mobile menu button needed to open the sidebar drawer on small screens.

**What is already in place**

- Fixed desktop sidebar (`w-64`) with active-state styling and `react-icons`.
- Mobile slide-in sidebar drawer with backdrop and close control.
- Fixed top header shell that reserves its height with `--app-nav-height`.
- Full-width main content viewport with the established padding rhythm (`p-6 md:p-8`).
- Shared footer.
- Tailwind CSS v4 theme, custom scrollbars, and horizontal-overflow guard.
- Prisma 7 schema, PostgreSQL datasource, Prisma client singleton, and a `.env` connection string.
- The reusable `components/ui` primitive library, ready for use by upcoming features.

---

## 2. How to Run Locally

### Prerequisites
- **Node.js**: `20.9.0` or later (Next.js 16 minimum)
- **PostgreSQL**: local server or hosted PostgreSQL (e.g. Supabase, Neon)
- **npm** (v9+)

### Installation & Startup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the environment file:**
   ```bash
   # Windows PowerShell:
   Copy-Item .env.example .env

   # Linux/macOS:
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your PostgreSQL credentials.

3. **Generate the Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Create the database** (if it does not exist yet), then verify the migration state:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

6. **Production build verification (optional):**
   ```bash
   npm run build
   npm run start
   ```

---

## 3. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma with `@prisma/adapter-pg` | `postgres://postgres:password@localhost:5432/spoken_english_practice?schema=public` |
| `NODE_ENV` | Application runtime environment | `development` |

`.env` is gitignored; only `.env.example` is committed.

---

## 4. Database Setup

- **Provider**: PostgreSQL
- **ORM**: Prisma 7 (`prisma-client` generator output to `src/generated/prisma`)
- **Runtime driver**: `@prisma/adapter-pg` wrapped by the singleton in `src/lib/prisma.ts`
- **Configuration**: `prisma.config.ts` loads `.env` via `dotenv/config` and supplies the datasource URL

The schema currently declares only the generator and datasource — no domain models yet. The first feature step will introduce the initial models and its migration. Until then, `npx prisma migrate dev` reports the database is already in sync.

When models are added:

```bash
npx prisma generate
npx prisma migrate dev --name <migration-name>
```

All entity IDs should follow the project convention: `String @id @default(uuid())`.

---

## 5. Project Structure

```text
src/
├── app/
│   ├── page.tsx                 # Home page
│   ├── presentation/page.tsx    # Presentation page
│   ├── practice/page.tsx        # Practice page
│   ├── layout.tsx               # Root layout — fonts, metadata, AppLayoutShell
│   ├── globals.css              # Tailwind import, theme variables, scrollbars
│   └── not-found.tsx            # 404 page
├── components/
│   ├── features/                # Page-level sections, one folder per page
│   │   ├── home/
│   │   ├── presentation/
│   │   └── practice/
│   ├── shared/                  # AppLayoutShell, Sidebar, Navbar, Footer
│   └── ui/                      # Reusable primitives (buttons, inputs, tables, ...)
├── lib/
│   ├── prisma.ts                # PrismaClient singleton with @prisma/adapter-pg
│   └── utils.ts                 # Date, currency and pagination helpers
├── server/
│   └── types/                   # Server-side payload and pagination interfaces
└── generated/prisma/            # Generated Prisma client (gitignored)
```

Reserved for upcoming features (created as needed): `src/features` for client islands, `src/server/{services,repositories}`, `src/types`, and `src/lib/validations`.

---

## 6. Layout & Navigation

The shell is composed in `src/app/layout.tsx` and `src/components/shared/AppLayoutShell.tsx`:

- `AppLayoutShell` is a client component that owns the mobile sidebar open/closed state.
- `Sidebar` renders the fixed desktop rail plus the mobile drawer, sharing one `navItems` list.
- `Navbar` is the fixed header. Its only control is the mobile hamburger; all other header content is intentionally absent for now.
- `main` offsets itself with `pt-[var(--app-nav-height)]` so the fixed header never overlaps content.
- `Footer` sits at the bottom of the main column.

Active sidebar items use the established styling: `bg-indigo-50 text-indigo-700 font-semibold` with an indigo icon.

---

## 7. Shared UI Primitives

The following primitives are available in `src/components/ui` and ready for reuse:

| File | Export |
| :--- | :--- |
| `src/components/ui/alerts/Alerts.tsx` | `showSuccessAlert`, `showErrorAlert` |
| `src/components/ui/badges/Badge.tsx` | `Badge` |
| `src/components/ui/buttons/Button.tsx` | `Button` |
| `src/components/ui/buttons/TableActionButton.tsx` | `TableActionButton`, `TableActionLink` |
| `src/components/ui/dropdowns/Dropdown.tsx` | `Dropdown` |
| `src/components/ui/inputs/Input.tsx` | `Input` |
| `src/components/ui/inputs/SearchInput.tsx` | `SearchInput` |
| `src/components/ui/modals/Modal.tsx` | `Modal` |
| `src/components/ui/pagination/Pagination.tsx` | `Pagination` |
| `src/components/ui/stats/StatCard.tsx` | `StatCard` |
| `src/components/ui/tables/DataTable.tsx` | `DataTable`, `Column` |

---

## 8. Quality Gates

| Check | Command | Current Result |
| :--- | :--- | :--- |
| Lint | `npm run lint` | 0 errors, 1 known `react-hooks/exhaustive-deps` warning in `SearchInput` |
| Types | `npx tsc --noEmit` | Clean |
| Build | `npm run build` | Clean — `/`, `/practice`, `/presentation`, `/_not-found` prerendered |

The pages currently prerender statically because they do not read request data. When a page starts reading URL search params or per-request data, await `connection()` before the read so it renders as a partial prerender instead of a stale static snapshot.
