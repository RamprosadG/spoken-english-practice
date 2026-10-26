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

The project is at the **foundation + Practice workspace + authentication stage**. The app shell, navigation, UI primitives, database wiring, the Practice feature, and cookie-based auth (email/password, Google, complete profile, hidden admin registration) are in place. Home and Presentation remain placeholders — do not add feature content to them until a feature step explicitly asks for it. No page or route is protected; auth only drives the header controls and the account API.

---

## Directory Conventions & Architecture

```text
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── presentation/page.tsx    # Presentation
│   ├── practice/page.tsx        # Practice
│   ├── admin-register/page.tsx  # Hidden admin registration (noindex, not in sidebar)
│   ├── api/auth/                # Auth route handlers (direct service calls)
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
│   └── practice/                # PracticeWorkspace: text, IPA, accent, speech controls
├── server/
│   ├── services/                # Business workflows, skeleton/KPI aggregation, session resolution
│   ├── repositories/            # Prisma data access; visibility rules live here
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
- **Routes**: Home is `/`; the other visible pages are `/presentation` and `/practice`. `/admin-register` exists but must stay unlinked from the sidebar. Sidebar active state compares `pathname === href`.
- **Page content**: Pages render a `components/features/<area>/<Area>Header` component. Keep the established page container (`flex flex-col gap-6 w-full`).
- **Layout offsets**: The fixed header height lives in `--app-nav-height`; do not hardcode `pt-16` in the shell.
- **Styling baseline**: Preserve the existing shell classes (`w-64` sidebar, `lg:pl-64`, `p-6 md:p-8`, indigo active state, slate borders). Style changes must be broad and intentional, not incidental to a refactor.

### 2. Prisma & Database
- **Client location**: The Prisma client is generated into `src/generated/prisma`. Always import the singleton from `@/lib/prisma`.
- **Adapter**: Instantiate `PrismaClient` only through `@prisma/adapter-pg` as already wired in `src/lib/prisma.ts`.
- **Primary & foreign keys**: Use `String @id @default(uuid())`. Do not use integer autoincrement IDs.
- **Schema changes**: After editing `prisma/schema.prisma`, run `npx prisma generate` and `npx prisma migrate dev --name <name>`.
- **Seed**: The auth models exist but there is still no seed script. Add one only when seed data is genuinely required, and wire it back into `prisma.config.ts` and `package.json` at that point.
- **Migrations**: Commit `prisma/migrations` alongside schema changes. Do not edit generated SQL after it has been applied.

### 3. Next.js & React 19 Standards
- **Server Components by default**: Add `"use client"` only for state, event handlers, or browser APIs. The shell components are client islands; page components stay server components.
- **Layered backend**: When features arrive, route handlers (`src/app/api/...`) delegate to `src/server/services/` and repositories. Validate inputs with Zod schemas from `src/lib/validations/`.
- **Server-rendered pages**: Feature pages should be Server Components that call their service directly and stream through `<Suspense>`. Keep search, filter, and page state in URL search params — not in client state — so only filter bars, pagination, and modals are client islands.
- **List vs. KPI queries**: Pair each ledger list endpoint with an unfiltered summary endpoint for stat cards. Push search and filters into the Prisma `where` and paginate with `count` + `skip`/`take`.
- **Authentication**: Auth exists but is header-only. Do not add route guards, redirects, or role checks to pages unless a requirement explicitly asks for them. See the Authentication section below.
- **Request data**: If a page reads `request.url` or search params, await `connection()` before the read so it does not serve a stale prerendered snapshot. Any route handler or page that reads cookies must do the same; put `await connection()` before the `try` block so framework control-flow errors are not swallowed by `handleApiError`.

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
- **Client island**: `src/features/practice/PracticeWorkspace.tsx` owns text, accent, speed, IPA, and playback state. The Practice page remains a Server Component.
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
- **Do not delete unrelated files** or restructure directories when adding a feature.
