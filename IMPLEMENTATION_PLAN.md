# Implementation Plan: Spoken English Practice

This document tracks the step-by-step implementation of the Spoken English Practice application. Each feature follows a **UI Layout First → Real API & Database Integration → Verification** pattern.

---

## 📊 Overall Progress Summary

- [x] **Step 0: Project Bootstrap, Layout Shell, Routes, Prisma & UI Primitives** *(Completed)*
- [ ] **Step 1: Presentation Module** *(Planned)*
- [x] **Step 2: Practice Module — IPA & Speech Workspace** *(Completed)*
- [x] **Step 3: Authentication — Header Login, Google, Complete Profile & Admin Register** *(Completed)*
- [ ] **Step 4: Persistence & Progress Tracking** *(Planned)*
- [ ] **Step 5: Polish, Responsive QA & Documentation** *(Planned)*

---

## 🛠️ Detailed Step Breakdown

### Step 0: Project Bootstrap, Layout Shell, Routes, Prisma & UI Primitives
**Goal**: Establish the project foundation with the established architecture, styling, and folder conventions, without adding feature content.

- [x] **0.1 Project Bootstrap**:
  - [x] Create `package.json` with Next.js 16.4.2, React 19.3.0, Tailwind CSS v4, Prisma 7, `@prisma/adapter-pg`, `react-icons`, `sweetalert2`, and Zod.
  - [x] Add `tsconfig.json` (strict mode, `@/*` path alias), `next.config.ts` (Turbopack CSS loader, Cache Components, Partial Prefetching), `eslint.config.mjs`, and `.gitignore`.
  - [x] Install dependencies and generate `package-lock.json`.

- [x] **0.2 Shared Layout & Navigation**:
  - [x] Create `src/components/shared/AppLayoutShell.tsx` with the desktop sidebar offset (`lg:pl-64`), fixed header, main viewport, and footer.
  - [x] Create `src/components/shared/Sidebar.tsx` with a fixed desktop rail, mobile drawer, backdrop, active-item styling, and the three navigation items.
  - [x] Create `src/components/shared/Navbar.tsx` as the fixed header shell. It intentionally contains only the mobile menu button; the header body is empty for now.
  - [x] Create `src/components/shared/Footer.tsx` with the established footer styling.
  - [x] Create `src/app/layout.tsx` with Geist fonts, metadata, and the shell wrapper.
  - [x] Create `src/app/globals.css` with the Tailwind import, theme variables, custom scrollbars, and the `--app-nav-height` offset (replacing the role-specific navbar variables).

- [x] **0.3 Pages & Routing**:
  - [x] Home route at `/` with `HomeHeader` (page name only).
  - [x] Presentation route at `/presentation` with `PresentationHeader` (page name only).
  - [x] Practice route at `/practice` with `PracticeHeader` (page name only).
  - [x] Add `src/app/not-found.tsx` with the shared 404 treatment.
  - [x] Confirm sidebar links and active states match all three routes.

- [x] **0.4 Database Setup**:
  - [x] Add `prisma/schema.prisma` with the `prisma-client` generator (output `src/generated/prisma`), PostgreSQL datasource, and no domain models yet.
  - [x] Add `prisma.config.ts` loading `dotenv/config` and the datasource URL.
  - [x] Add `.env` / `.env.example` with `DATABASE_URL` and `NODE_ENV`.
  - [x] Add `src/lib/prisma.ts` singleton using `@prisma/adapter-pg`.
  - [x] Create the `spoken_english_practice` PostgreSQL database and run `npx prisma generate`.
  - [x] Run `npx prisma migrate dev`: database reported in sync (no models or pending migrations yet).

- [x] **0.5 Shared UI Primitives**:
  - [x] Copy the full `src/components/ui` primitive set: alerts, badges, buttons, dropdowns, inputs, modals, pagination, stats, and tables.
  - [x] Copy `src/lib/utils.ts` and `src/server/types/pagination.ts` so formatting and pagination helpers are ready for feature work.

- [x] **0.6 Documentation**:
  - [x] Write `README.md` covering the current scope, local setup, environment variables, database setup, structure, layout behavior, UI primitives, and quality gates.
  - [x] Write `AGENTS.md` with the Next.js 16 rules, folder conventions, layout constraints, Prisma rules, and verification requirements.
  - [x] Record the completed Step 0 in this plan.

- [x] **0.7 Verification**:
  - [x] `npm run lint`: 0 errors (1 known `SearchInput` exhaustive-deps warning).
  - [x] `npx tsc --noEmit`: clean.
  - [x] `npm run build`: clean — `/`, `/practice`, `/presentation`, and `/_not-found` prerender successfully.
  - [x] Browser verification: shell, sidebar active states, mobile drawer, and empty header render correctly across the three routes.

---

### Step 1: Presentation Module *(Planned — scope to be confirmed)*
**Goal**: Give the Presentation page its first real content and data flow.

- [ ] **1.1 Data Model & API**:
  - [ ] Define the presentation-related Prisma models (topics, prompts, or presentations) after the product scope is confirmed.
  - [ ] Create the first migration and a seed script; re-enable the seed command in `prisma.config.ts` and `package.json`.
  - [ ] Add Zod validation schemas, a repository, and a service for the new domain.
  - [ ] Add list and summary route handlers following the list/KPI split.
- [ ] **1.2 UI Layer**:
  - [ ] Replace the Presentation page placeholder with a server-rendered section that calls the service directly.
  - [ ] Reuse `DataTable`, `SearchInput`, `Dropdown`, `Pagination`, `StatCard`, and `Badge` from `src/components/ui`.
  - [ ] Put filters and page state in URL search params; keep only interactive controls as client islands.
- [ ] **1.3 Verification**:
  - [ ] Verify filtered and paginated queries execute in SQL, not in memory.
  - [ ] Run lint, typecheck, and build; verify the route renders correctly in the browser.

---

### Step 2: Practice Module — IPA & Speech Workspace *(Completed)*
**Goal**: Build a browser-based speaking practice workspace with dialect-aware IPA transcription and speech playback.

- [x] **2.1 Workspace Foundation**:
  - [x] Add the `phonemize` dependency for English IPA generation (`en-GB` and `en-US`).
  - [x] Create the `PracticeWorkspace` client island in `src/features/practice`.
  - [x] Render the workspace from the server-rendered Practice page below the existing page header.
  - [x] Add a labelled English text textarea, accent dropdown, speed dropdown, IPA toggle, and playback status area.
  - [x] Save the practice text to `localStorage` as it changes, restore it on reload through `useSyncExternalStore`, and clear the entry when the textarea is emptied.

- [x] **2.2 IPA Translation**:
  - [x] Show IPA only when the "Show IPA translation" toggle is enabled.
  - [x] Generate a dialect-aware transcription for the current text and accent.
  - [x] Import `phonemize` on demand so its dictionary is excluded from the initial page bundle.
  - [x] Debounce text changes and expose loading, empty, and error states.
  - [x] Produce sentence pairs with `Intl.Segmenter`, merge abbreviation endings, and add an IPA view dropdown for "Sentence by sentence" (English sentence, IPA line, then spacing) or "Full translation".

- [x] **2.3 Speech Playback**:
  - [x] Add Start/Resume, Pause, and Reset controls with disabled states that follow playback status.
  - [x] Use `SpeechSynthesisUtterance` with the selected `en-GB` / `en-US` accent and an exact-match system voice.
  - [x] Add a Speed dropdown (`0.5×`–`1.5×`) wired to `utterance.rate`; stop playback and show a notice when speed changes mid-playback.
  - [x] Show a fallback notice when the selected accent has no installed voice.
  - [x] Cancel playback on reset, text change, accent change, speed change, and component unmount.
  - [x] Guard end/error callbacks with the active utterance ref so cancelled speech cannot overwrite newer state.

- [x] **2.4 Styling & Responsive QA**:
  - [x] Restyle the workspace with shared card, control, and status patterns that match the shell.
  - [x] Verify the control grid at mobile (1 column), tablet (2), and desktop (3), with full-width action buttons below `sm`.
  - [x] Confirm no horizontal overflow at 390 px, 768 px, and 1440 px.

- [x] **2.5 Verification**:
  - [x] `npx tsc --noEmit`: clean.
  - [x] `npm run lint`: 0 errors (1 known `SearchInput` warning).
  - [x] `npm run build`: clean.
  - [x] Browser-verified British and American IPA output, accent switching, speed-driven `utterance.rate`, mid-playback speed changes, IPA view switching, Start/Pause/Resume/Reset transitions, text restoration after reload, and the missing-voice notice.
  - [ ] Database persistence of practice sessions is intentionally deferred to Step 4.

---

### Step 3: Authentication — Header Login, Google, Complete Profile & Admin Register *(Completed)*
**Goal**: Add cookie-based authentication that only changes the header controls; no page or route is protected.

- [x] **3.1 Schema, Environment & Dependencies**:
  - [x] Use the user-provided `User` and `RefreshToken` Prisma models and the `20261026161057_create_user_and_refresh_token_tables` migration.
  - [x] Add `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, `HASH_SALT_ROUNDS`, `ADMIN_REGISTER_KEY`, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env` and `.env.example`.
  - [x] Install `bcryptjs`, `jsonwebtoken`, `@react-oauth/google`, and `@types/jsonwebtoken`; remove the redundant `@types/bcryptjs`.
  - [x] Render the header user badge from the account's name initial; no profile pictures are stored.

- [x] **3.2 Server Foundation**:
  - [x] Add `src/lib/auth/tokens.ts`: HS512 signing, verification, SHA-256 hashing, cookie helpers, 30-minute access / 7-day refresh TTLs, and a 30-second reuse grace period.
  - [x] Add `src/lib/auth/password.ts` (bcrypt) and Zod schemas in `src/lib/validations/auth.ts`.
  - [x] Add an `ApiError` / `handleApiError` helper that maps `ZodError` to `400` and `ApiError` to its status.
  - [x] Add `user` and `refresh-token` repositories, including transactional token rotation.

- [x] **3.3 Auth Service & API Routes**:
  - [x] Implement register, admin register, email/password login, Google login, profile, complete profile, logout, and `resolveSessionUser` in `src/server/services/auth.service.ts`.
  - [x] Add direct-service route handlers for `register`, `register-admin`, `login`, `login-google`, `profile`, `complete-profile`, and `logout`.
  - [x] Return the shared `{ success, message, data }` shape and set/clear httpOnly cookies with environment-aware flags.
  - [x] Await `connection()` before reading cookies in `/api/auth/profile` so it is never prerendered.

- [x] **3.4 Header UI & Hidden Admin Page**:
  - [x] Add `AuthProvider`, `GoogleAuthProvider`, and the auth fetch helper in `src/features/auth`.
  - [x] Add login, register, complete-profile, and admin-register forms plus `AuthModals`.
  - [x] Show **Login** / **Register** in the header when signed out and `UserMenu` when signed in, including the incomplete-profile prompt and logout.
  - [x] Add the unlinked `/admin-register` page with `noindex` metadata and the private admin key field.
  - [x] Keep the header responsive, including a loading placeholder and disabled Google button when unconfigured.

- [x] **3.5 Verification**:
  - [x] API: register `201`, duplicate `409`, wrong password `401`, login `200`, profile `200`, complete-profile `200`, logout `200` then profile `401`, re-login with the new password `200`.
  - [x] Admin registration: wrong key `403`, correct key `201`, created role `admin`.
  - [x] Refresh-only rotation returns new cookies; reuse past the grace period invalidates all sessions (`401`); invalid Google token `401`.
  - [x] Browser: header buttons, all modals, login/user menu/logout, register-to-login switch, incomplete-profile prompt, complete-profile flow, admin page fields, and no sidebar link.
  - [x] Responsive checks at 390 px, 768 px, and 1440 px show no horizontal overflow; the login modal fits a 390 px viewport.
  - [x] Production build clean; `npm start` smoke test confirms `Secure; HttpOnly; SameSite=none` cookies.
  - [ ] Google login with real credentials remains for the user to test later.
  - [x] Temporary test accounts and refresh tokens removed; the database is back to zero users.

---

### Step 4: Persistence & Progress Tracking *(Planned — scope to be confirmed)*
**Goal**: Persist practice sessions and surface practice history and progress.

- [ ] Define the practice session/attempt Prisma models and add the first migration.
- [ ] Add validation schemas, repositories, services, and route handlers.
- [ ] Surface practice history and progress panels using the existing `StatCard` and `DataTable` primitives.
- [ ] Keep summary reads unfiltered and independent from ledger filters.

---

### Step 5: Polish, Responsive QA & Documentation *(Planned)*
**Goal**: Harden the application and keep documentation current.

- [ ] Verify desktop, tablet, and mobile layouts for all routes.
- [ ] Check empty, loading, error, and unauthorized states for every new feature.
- [ ] Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
- [ ] Update `README.md`, `AGENTS.md`, and this plan with the final feature set.
