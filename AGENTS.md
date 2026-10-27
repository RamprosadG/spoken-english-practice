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
- **Speech & IPA**: Browser `speechSynthesis` for playback; `phonemize` for dialect-aware IPA

The project is at the **foundation + Presentation library + Practice workspace + authentication stage**. The app shell, navigation, UI primitives, database wiring, the Presentation library, the read-only presentation practice page, the Practice feature, and cookie-based auth (email/password, Google, complete profile, hidden admin registration) are in place. Home remains a placeholder — do not add feature content to it until a feature step explicitly asks for it. No page route is protected; auth drives the header controls and the account API, and presentation mutations are admin-only.

---

## Directory Conventions & Architecture

```text
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── presentation/page.tsx    # Presentation library (Suspense + server read)
│   ├── presentation/[id]/page.tsx # Presentation practice (server read + read-only workspace)
│   ├── practice/page.tsx        # Practice
│   ├── admin-register/page.tsx  # Hidden admin registration (noindex, not in sidebar)
│   ├── api/auth/                # Auth route handlers (direct service calls)
│   ├── api/presentations/       # List plus admin-only create/update/delete handlers
│   ├── layout.tsx               # Root layout: fonts, metadata, providers, AppLayoutShell
│   └── not-found.tsx
├── components/
│   ├── features/                # Server-rendered page sections, one folder per page
│   │   ├── auth/
│   │   ├── home/
│   │   ├── presentation/
│   │   └── practice/
│   ├── shared/                  # AppLayoutShell, Sidebar, Navbar, UserMenu, Footer
│   └── ui/                      # Generic reusable primitives
├── features/                    # Client islands
│   ├── auth/                    # AuthProvider, auth modals/forms, Google button, fetch helper
│   ├── presentation/            # Actions, Filters, Section, Table, practice workspace, form modal, fetch helper
│   └── practice/                # PracticeWorkspace plus shared useSpeechPractice, controls, and IPA card
├── server/
│   ├── services/                # Business workflows, presentation CRUD, session resolution
│   ├── repositories/            # Prisma data access; presentation persistence
│   └── types/                   # Per-domain payload, filter and pagination interfaces
├── types/                       # Client-facing view-model types per feature
└── lib/
    ├── auth/                    # JWT signing/verification, cookie helpers, bcrypt
    ├── prisma.ts                # PrismaClient singleton (import PrismaClient from '@/generated/prisma/client')
    ├── utils.ts                 # Formatting and pagination helpers
    ├── api-error.ts             # ApiError + shared route-handler error formatting
    └── validations/             # Zod schemas — added with features
```

---

## Technical Rules & Best Practices

### 1. Layout & Navigation
- **Single shell**: All pages render inside `AppLayoutShell`. Do not create per-page sidebars or headers.
- **Sidebar state**: `AppLayoutShell` owns the mobile drawer state and passes handlers to `Navbar` and `Sidebar`. Keep it that way unless a cross-tree consumer appears.
- **Header content**: `Navbar` owns the mobile hamburger and the auth area. Signed out it shows **Login** / **Register**; signed in it shows `UserMenu`. Do not add other header content without a requirement.
- **Routes**: Home is `/`; the other visible pages are `/presentation` and `/practice`. `/presentation/[id]` is the read-only practice page for one saved presentation. `/admin-register` exists but must stay unlinked from the sidebar. Sidebar active state compares `pathname === href`.
- **Dynamic-route shell**: `AppLayoutShell` wraps `Sidebar` in `<Suspense>` with a width-preserving fallback. `usePathname()` must suspend while a dynamic route is prerendered — do not remove that boundary or turn it into a high-level page fallback.
- **Page content**: Pages render a `components/features/<area>/<Area>Header` component. Keep the established page container (`flex flex-col gap-6 w-full`).
- **Layout offsets**: The fixed header height lives in `--app-nav-height`; do not hardcode `pt-16` in the shell.
- **Styling baseline**: Preserve the existing shell classes (`w-64` sidebar, `lg:pl-64`, `p-6 md:p-8`, indigo active state, slate borders). Style changes must be broad and intentional, not incidental to a refactor.

### 2. Prisma & Database
- **Client location**: The Prisma client is generated into `src/generated/prisma`. Always import the singleton from `@/lib/prisma`.
- **Adapter**: Instantiate `PrismaClient` only through `@prisma/adapter-pg` as already wired in `src/lib/prisma.ts`.
- **Primary & foreign keys**: Use `String @id @default(uuid())`. Do not use integer autoincrement IDs.
- **Schema changes**: After editing `prisma/schema.prisma`, run `npx prisma generate` and `npx prisma migrate dev --name <name>`.
- **Seed**: The auth and presentation models exist but there is still no seed script. Add one only when seed data is genuinely required, and wire it back into `prisma.config.ts` and `package.json` at that point.
- **Migrations**: Commit `prisma/migrations` alongside schema changes. Do not edit generated SQL after it has been applied.

### 3. Next.js & React 19 Standards
- **Server Components by default**: Add `"use client"` only for state, event handlers, or browser APIs. The shell components are client islands; page components stay server components.
- **Layered backend**: When features arrive, route handlers (`src/app/api/...`) delegate to `src/server/services/` and repositories. Validate inputs with Zod schemas from `src/lib/validations/`.
- **Server-rendered pages**: Feature pages should be Server Components that call their service directly and stream through `<Suspense>`. The Presentation page is the reference pattern: a static page shell with a fallback, plus an inner async component that awaits `connection()` and calls the service. Keep search, filter, and page state in URL search params — not in client state — so only filter bars, pagination, and modals are client islands.
- **List vs. KPI queries**: Pair each ledger list endpoint with an unfiltered summary endpoint for stat cards. Push search and filters into the Prisma `where` and paginate with `count` + `skip`/`take`.
- **Authentication**: Pages remain public. Do not add route guards, redirects, or role checks to pages unless a requirement explicitly asks for them. Presentation create/update/delete are the exception at the service layer, enforced with `requireAdminUser()`. See the Authentication section below.
- **Request data**: If a page reads `request.url`, route params, or search params, await `connection()` before the read so it does not serve a stale prerendered snapshot. Put the `await connection()` and the data read inside a `<Suspense>` boundary so the route can still prerender its shell. `/presentation/[id]` is the exception: it sets `export const instant = false` so the page blocks until the record loads and an unknown id can return a real `404`. Any route handler or page that reads cookies must do the same; put `await connection()` before the `try` block so framework control-flow errors are not swallowed by `handleApiError`.

### 4. Presentation Feature
- **Data model**: `Presentation` stores `id` (UUID), `title`, `text`, `sequence`, `createdAt`, and `updatedAt`, mapped to the `presentation` table. Sequence is not unique; list order is `sequence` ascending, then `createdAt` ascending.
- **Read path**: `src/app/presentation/page.tsx` wraps `PresentationContent` in `<Suspense>`. That async component awaits `connection()`, reads the `search` and `page` search params, and calls `listPresentations()` directly. The service awaits `connection()` again and delegates to `findPresentationPage()`, which applies a case-insensitive title `contains`, runs `count` plus `skip`/`take`, and returns `buildPaginationMeta` output. The default page size is `PRESENTATION_PAGE_SIZE` (20). Do not call `resolveSessionUser()` in this Server Component — refresh logic can write cookies.
- **Write path**: Route handlers in `src/app/api/presentations/` parse with `presentationInputSchema`, call the service, and return `{ success, message, data }`. The service methods call `requireAdminUser()`, which throws `401` when signed out and `403` for non-admins. `GET /api/presentations` stays public and uses `parsePagination(searchParams, PRESENTATION_PAGE_SIZE)`.
- **UI**: The header combines the title, subtitle, and admin-only **New presentation** action. `PresentationFilters` wraps the debounced `SearchInput`; `PresentationSection` keeps search and page state in the URL via `router.replace`, owns the edit modal and SweetAlert delete, and renders `Pagination` when rows exist. `PresentationTable` shows a 100-character text preview with a `...` suffix, uses `FiEdit` for edit, and gates edit/delete on `role === "admin"`. Successful mutations call `router.refresh()`.
- **Practice route**: `/presentation/[id]` awaits `connection()` and the `params` promise, calls `getPresentationById()`, and renders `notFound()` when the record is missing. The header shows the back link, the presentation title, and a subtitle. `PresentationPracticeWorkspace` renders the saved text in a read-only container (`max-h-96 overflow-y-auto whitespace-pre-wrap`) followed by the shared speech controls and IPA card. It must not read or write the practice `localStorage` entry and must not offer text editing.
- **Validation**: Title 1–200 characters, text 1–20,000 characters, sequence an integer from 1 to 100,000. New rows default to `max(sequence) + 1` from `findNextPresentationSequence()`.

### 5. Authentication
- **Server logic lives in** `src/server/services/auth.service.ts`; route handlers in `src/app/api/auth/*` only parse input, call the service, and return `{ success, message, data }`. Never call another route handler over HTTP.
- **Validation**: Use the Zod schemas in `src/lib/validations/auth.ts`. Errors flow through `ApiError` and `handleApiError` (`src/lib/api-error.ts`), which maps `ZodError` to `400` and `ApiError` to its status.
- **Tokens**: HS512 JWTs. Access token lasts 30 minutes in the `accessToken` httpOnly cookie; refresh token lasts 7 days in `refreshToken`. Store only the SHA-256 hash of the refresh token. Refresh tokens are single-use with a 30-second grace period, rotate on use, and reuse past the grace period deletes all sessions for that user.
- **Cookies**: Build options in `src/lib/auth/tokens.ts` — `httpOnly`, `path: "/"`, `sameSite=lax` in development and `secure` + `sameSite=none` in production. Use `cookies()` from `next/headers` (async in Next 16); clear both cookies on logout.
- **Passwords**: Always hash with `hashPassword` (bcryptjs, `HASH_SALT_ROUNDS`, default 10). Never store or log plaintext. Google-created users have no password and `isComplete: false` until they complete the profile.
- **Registration**: `/api/auth/register` creates a `public` user and does not sign them in. Duplicate emails return `409`. `/api/auth/register-admin` creates an `admin` user only when `adminSecretKey` matches `ADMIN_REGISTER_KEY`; otherwise `403`.
- **Google login**: The client uses the implicit flow (`@react-oauth/google`, `useGoogleLogin`). The API exchanges the access token at `https://www.googleapis.com/oauth2/v3/userinfo`. `GoogleAuthProvider` renders only when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set, and the button stays disabled with a notice otherwise. Do not test Google login with real credentials in automation.
- **Client state**: `AuthProvider` (`src/features/auth/AuthProvider.tsx`) owns `user`, `isAuthLoading`, and `activeModal`. Fetch `/api/auth/profile` on mount and treat `401` as signed out. Use `setAuthenticatedUser` after login/complete-profile and `logout` for sign-out.
- **Modals**: Login, register, and complete-profile are modal flows (`src/features/auth/AuthModals.tsx`), mounted from `Navbar`. Keep the user menu in `src/components/shared/UserMenu.tsx`.
- **Hidden admin page**: `/admin-register` must stay unlinked from the sidebar and keep `robots: { index: false, follow: false }`.
- **Environment**: `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, `HASH_SALT_ROUNDS`, `ADMIN_REGISTER_KEY`, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. `.env` stays gitignored; update `.env.example` with placeholders only.

### 6. Practice Feature (IPA & Speech)
- **Client islands**: `src/features/practice/PracticeWorkspace.tsx` owns the editable text and renders the shared pieces from `useSpeechPractice.ts`, `SpeechPracticeControls.tsx`, and `IpaTranscriptionCard.tsx`. `src/features/presentation/PresentationPracticeWorkspace.tsx` reuses the same hook and components with the saved presentation text, so IPA and speech behavior stays in one place. The Practice and Presentation pages remain Server Components.
- **Text changes**: Cancel playback and reset the IPA state through `practice.handleTextEdited()` when the editable text changes. The saved presentation text never changes in the browser, so it does not need that hook.
- **IPA**: Import `phonemize` dynamically inside the transcription effect so its pronunciation data stays out of the initial bundle. Pass the selected dialect (`en-GB` / `en-US`), debounce text changes, and handle loading and failure states. Produce both a full transcription and sentence pairs so the "Sentence by sentence" / "Full translation" view dropdown can switch without recomputing.
- **Sentence splitting**: Use `Intl.Segmenter` with `granularity: "sentence"` and treat newlines as hard boundaries. Merge segments that end in a known abbreviation (`Mr.`, `Dr.`, `e.g.`, `Jan.`), a single capital initial, or a list number so they are not shown as separate cards.
- **Speech**: Use `window.speechSynthesis` and `SpeechSynthesisUtterance`. Set `utterance.rate` from the Speed dropdown, cancel playback when the text, accent, or speed changes, on reset, and on unmount. Guard callbacks with the active utterance ref so a cancelled utterance cannot overwrite newer playback state.
- **Voice availability**: Voices are supplied by the OS/browser. Prefer an exact `en-GB`/`en-US` voice; if none exists, leave the voice unset and show the fallback notice instead of silently using the wrong accent.
- **Responsive layout**: Keep the workspace on the shared card styling (`rounded-xl border-slate-200`). Controls use `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`; action buttons are full width below `sm` and auto width above. Verify no horizontal overflow at 390 px, 768 px, and 1440 px.
- **Browser persistence**: The practice text is saved to `localStorage` under `spoken-english-practice:text` on every edit and read through `useSyncExternalStore` so hydration stays consistent; emptying the textarea removes the entry. IPA and audio remain session-only. Do not add database writes or audio uploads until a requirement defines them.

### 7. UI Primitives
- Reuse `src/components/ui` before building new primitives. The library includes `Button`, `Input`, `SearchInput`, `Dropdown`, `Modal`, `DataTable`, `Pagination`, `StatCard`, `Badge`, `TableActionButton`, and the SweetAlert helpers.
- Shared composites belong in `src/components/shared`; page-specific sections belong in `src/components/features/<area>`; client-only forms/modals belong in `src/features/<domain>`.

### 8. Code Quality & Verification
- **Strict TypeScript**: Avoid `any`; use Prisma model types from `@/generated/prisma/client`.
- **Lint**: `npm run lint` must stay at zero errors. The only accepted warning is the deliberate `react-hooks/exhaustive-deps` deviation in `SearchInput.tsx`; keep it documented with a reasoned `eslint-disable` rather than restructuring the effect.
- **Build**: Run `npx tsc --noEmit` and `npm run build` after structural or schema changes. Keep the build clean.
- **Auth changes**: Verify register, login, profile, logout, complete-profile, and admin-key rejection against the running API; also verify the signed-in header and user menu in the browser. Do not exercise Google login without real credentials.
- **Presentation changes**: Verify unauthenticated mutations return `401`, public users get `403`, and admins can create/update/delete through both the API and the modal UI. Confirm every visitor sees the table and **Practice now** link, that `router.refresh()` updates the table, and that the dynamic route renders. Clean up any temporary users and presentations afterward.
- **Do not delete unrelated files** or restructure directories when adding a feature.
