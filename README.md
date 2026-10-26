# Spoken English Practice

A full-stack **Spoken English Practice** application built with **Next.js 16 (App Router & Turbopack)**, **TypeScript**, **Tailwind CSS v4**, **PostgreSQL**, and **Prisma ORM 7** with the `@prisma/adapter-pg` driver.

This repository contains the **layout-first foundation** plus the interactive **Practice workspace**: the application shell, navigation, three portal pages, shared UI primitives, database wiring, and client-side IPA and speech playback for practice text. IPA transcription is provided by `phonemize`; voice playback uses the browser Web Speech API.

---

## 📑 Table of Contents
1. [Current Scope](#1-current-scope)
2. [How to Run Locally](#2-how-to-run-locally)
3. [Environment Variables](#3-environment-variables)
4. [Database Setup](#4-database-setup)
5. [Project Structure](#5-project-structure)
6. [Layout & Navigation](#6-layout--navigation)
7. [Practice Workspace](#7-practice-workspace)
8. [Shared UI Primitives](#8-shared-ui-primitives)
9. [Quality Gates](#9-quality-gates)

---

## 1. Current Scope

The application currently ships the shared application shell and three portal pages:

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | Home | Page heading only |
| `/presentation` | Presentation | Page heading only |
| `/practice` | Practice | Interactive text, IPA, and speech workspace |

Home and Presentation intentionally render only their page name inside a bordered page header. Practice contains the first feature screen. The top header remains deliberately empty apart from the mobile menu button needed to open the sidebar drawer on small screens.

**What is already in place**

- Fixed desktop sidebar (`w-64`) with active-state styling and `react-icons`.
- Mobile slide-in sidebar drawer with backdrop and close control.
- Fixed top header shell that reserves its height with `--app-nav-height`.
- Full-width main content viewport with the established padding rhythm (`p-6 md:p-8`).
- Shared footer.
- Tailwind CSS v4 theme, custom scrollbars, and horizontal-overflow guard.
- Prisma 7 schema, PostgreSQL datasource, Prisma client singleton, and a `.env` connection string.
- The reusable `components/ui` primitive library, ready for use by upcoming features.
- A Practice workspace with English text input, sentence-by-sentence or full IPA transcription, and browser speech playback with accent and speed controls.

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

The schema currently declares only the generator and datasource — no domain models yet. A later persistence step will introduce the initial models and their migration. Until then, `npx prisma migrate dev` reports the database is already in sync.

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
├── features/
│   └── practice/
│       └── PracticeWorkspace.tsx # Client island: text, IPA, accent and speech controls
├── lib/
│   ├── prisma.ts                # PrismaClient singleton with @prisma/adapter-pg
│   └── utils.ts                 # Date, currency and pagination helpers
├── server/
│   └── types/                   # Server-side payload and pagination interfaces
└── generated/prisma/            # Generated Prisma client (gitignored)
```

Reserved for upcoming features (created as needed): `src/server/{services,repositories}`, `src/types`, and `src/lib/validations`.

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

## 7. Practice Workspace

`src/features/practice/PracticeWorkspace.tsx` is a client island embedded by the Practice page:

- **English text** — a textarea for the text to practice; speech and IPA both follow its current value.
- **Accent dropdown** — British English (`en-GB`) or American English (`en-US`).
- **Speed dropdown** — `0.5×` through `1.5×`, applied to the utterance's `rate`. Changing speed during playback stops speech and asks you to press Start again.
- **Show IPA translation** — computes a dialect-aware IPA transcription. The `phonemize` package is loaded on demand, so its pronunciation data is not part of the initial page bundle.
- **IPA view dropdown** — switches between *Sentence by sentence*, where each sentence is paired with its own IPA line in a separated card, and *Full translation*, a single continuous transcription block. Sentences are found with `Intl.Segmenter`, with abbreviation handling for forms such as `Mr.`, `Dr.`, and `Jan.`, so manual line breaks are not required.
- **Start / Resume** — starts speech in the selected accent and speed, or resumes a paused utterance.
- **Pause** — pauses the active utterance; Start changes to Resume while paused.
- **Reset** — cancels playback, clears the pause state, and returns the status to ready.

The workspace uses a responsive card layout: controls and action buttons stack on phones, the control grid becomes two columns on tablets (`sm`) and three on wide screens (`xl`), and nothing overflows horizontally at 390 px, 768 px, or 1440 px.

Speech playback uses `window.speechSynthesis`. Available voices come from the operating system and browser. If no voice matches the selected accent, the app falls back to the browser's default English voice and displays a notice. The practice text is saved to `localStorage` (`spoken-english-practice:text`) as you type and restored on reload; emptying the textarea removes the saved entry. IPA and audio remain session-only, audio never leaves the browser, and nothing is written to the database yet.

---

## 8. Shared UI Primitives

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

## 9. Quality Gates

| Check | Command | Current Result |
| :--- | :--- | :--- |
| Lint | `npm run lint` | 0 errors, 1 known `react-hooks/exhaustive-deps` warning in `SearchInput` |
| Types | `npx tsc --noEmit` | Clean |
| Build | `npm run build` | Clean — `/`, `/practice`, `/presentation`, `/_not-found` prerendered |

The pages currently prerender statically because they do not read request data. When a page starts reading URL search params or per-request data, await `connection()` before the read so it renders as a partial prerender instead of a stale static snapshot.
