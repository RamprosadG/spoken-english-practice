# Spoken English Practice

A full-stack **Spoken English Practice** application built with **Next.js 16 (App Router & Turbopack)**, **TypeScript**, **Tailwind CSS v4**, **PostgreSQL**, and **Prisma ORM 7** with the `@prisma/adapter-pg` driver.

This repository contains the **layout-first foundation**, the **Presentation library**, the inline **Sentence library**, the inline **Vocabulary library**, the interactive **Practice workspace**, and cookie-based **authentication**: the application shell, navigation, shared UI primitives, database wiring, an admin-managed collection of saved presentation texts, a sentence library with Bengali meanings that expands for practice in place, a vocabulary library with Bengali meanings, example sentences, synonyms, antonyms, and automatic IPA, client-side IPA and speech playback, and email/password plus Google sign-in. IPA transcription is provided by `phonemize`; voice playback uses the browser Web Speech API; sessions use HS512 JWTs with rotating refresh tokens stored in PostgreSQL.

---

## 📑 Table of Contents
1. [Current Scope](#1-current-scope)
2. [How to Run Locally](#2-how-to-run-locally)
3. [Environment Variables](#3-environment-variables)
4. [Database Setup](#4-database-setup)
5. [Project Structure](#5-project-structure)
6. [Layout & Navigation](#6-layout--navigation)
7. [Authentication](#7-authentication)
8. [Presentation Library](#8-presentation-library)
9. [Sentence Library](#9-sentence-library)
10. [Vocabulary Library](#10-vocabulary-library)
11. [Practice Workspace](#11-practice-workspace)
12. [Shared UI Primitives](#12-shared-ui-primitives)
13. [Quality Gates](#13-quality-gates)

---

## 1. Current Scope

The application currently ships the shared application shell and its portal pages:

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | Home | Page heading only |
| `/presentation` | Presentation | Admin-managed library of saved titles and practice texts |
| `/presentation/[id]` | Presentation Practice | Read-only practice for one saved presentation: title, scrollable text, IPA, and speech |
| `/sentences` | Sentences | Admin-managed sentence library with Bengali meanings and inline, single-row practice |
| `/vocabulary` | Vocabulary | Admin-managed word library with Bengali meanings, example sentences, synonyms, antonyms, automatic IPA, and inline practice |
| `/practice` | Practice | Interactive text, IPA, and speech workspace |
| `/admin-register` | Admin Registration | Hidden form for creating an admin with the private secret key |

Home intentionally renders only its page name inside a bordered page header. Presentation is the first server-rendered data screen. The top header shows **Login** and **Register** actions on the right; once signed in, they are replaced by a user menu with the account name, email, complete-profile action when needed, and logout. Pages remain public — authentication changes the header controls, and only presentation, sentence, and vocabulary mutations are restricted to admins.

**What is already in place**

- Fixed desktop sidebar (`w-64`) with active-state styling and `react-icons`.
- Mobile slide-in sidebar drawer with backdrop and close control.
- Fixed top header shell that reserves its height with `--app-nav-height` and hosts the auth controls.
- Full-width main content viewport with the established padding rhythm (`p-6 md:p-8`).
- Shared footer.
- Tailwind CSS v4 theme, custom scrollbars, and horizontal-overflow guard.
- Prisma 7 schema with `User`, `RefreshToken`, `Presentation`, `Sentence`, and `Vocabulary` models, PostgreSQL datasource, Prisma client singleton, and a `.env` connection string.
- The reusable `components/ui` primitive library, ready for use by upcoming features.
- A Presentation library with a server-rendered, searchable, paginated table; admin-only create/update modals and delete confirmation; and a per-row **Practice now** link into the dynamic route.
- A Sentence library with a searchable, paginated table, admin-only create/edit/delete, and an inline practice panel that expands one row at a time with the English sentence, automatic IPA beneath it, Bengali meaning, per-sentence Listen, and accent/speed controls.
- A Vocabulary library with a searchable, paginated table, an initial-letter filter, admin-only create/edit/delete, and an inline practice panel showing automatic IPA and Listen for the word, example sentence, and each optional synonym and antonym.
- A Practice workspace with English text input, sentence-by-sentence or full IPA transcription, and browser speech playback with accent and speed controls.
- Email/password registration and login, Google login, complete-profile flow, hidden admin registration, logout, and rotating refresh-token sessions.

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
   Update `DATABASE_URL` with your PostgreSQL credentials, fill in the JWT and admin secrets, and add a Google OAuth client ID if you want Google sign-in enabled. See [Environment Variables](#3-environment-variables).

3. **Generate the Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Apply the migrations** (creates the `users`, `refresh_tokens`, `presentation`, `sentence`, and `vocabulary` tables):
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
| `JWT_ACCESS_TOKEN_SECRET` | HS512 secret used to sign 30-minute access tokens | 128-character random hex string |
| `JWT_REFRESH_TOKEN_SECRET` | HS512 secret used to sign 7-day refresh tokens; must differ from the access secret | 128-character random hex string |
| `HASH_SALT_ROUNDS` | bcrypt cost factor for password hashing | `10` |
| `ADMIN_REGISTER_KEY` | Private key required by the hidden `/admin-register` form | random 48-character hex string |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web client ID; Google sign-in stays disabled while empty | `1234567890-abc.apps.googleusercontent.com` |

Generate secrets locally without hardcoding them:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

`.env` is gitignored; only `.env.example` with placeholders is committed. `NEXT_PUBLIC_*` values are inlined in the client bundle, so restart the dev server after changing the Google client ID.

---

## 4. Database Setup

- **Provider**: PostgreSQL
- **ORM**: Prisma 7 (`prisma-client` generator output to `src/generated/prisma`)
- **Runtime driver**: `@prisma/adapter-pg` wrapped by the singleton in `src/lib/prisma.ts`
- **Configuration**: `prisma.config.ts` loads `.env` via `dotenv/config` and supplies the datasource URL

The schema declares the authentication, presentation, sentence, and vocabulary models:

- `User` — UUID id, unique email, optional bcrypt password, `admin` / `public` role, `isComplete`, and timestamps. Google-created users start with `isComplete: false` until they set a password.
- `RefreshToken` — UUID id, unique SHA-256 hash of the refresh JWT, owning user (cascade delete), `used` / `usedAt` for rotation, and `expiresAt`.
- `Presentation` — UUID id, title, practice text, integer `sequence`, and timestamps. Rows are ordered by `sequence` ascending and then `createdAt` ascending.
- `Sentence` — UUID id, English `text`, Bengali `meaning`, integer `sequence`, and timestamps, with a `sequence` index. Rows are ordered by `sequence` ascending and then `createdAt` ascending.
- `Vocabulary` — UUID id, required word `text`, Bengali `meaning`, example `sentence` and `sentenceMeaning`, nullable synonym fields (`synonymText`, `synonymMeaning`, `synonymSentence`, `synonymSentenceMeaning`), nullable antonym fields with the same shape, integer `sequence`, and timestamps, with a `sequence` index. Rows are ordered by `sequence` ascending and then `createdAt` ascending.

The migrations create the users and refresh tokens (`20261026161057_create_user_and_refresh_token_tables`), remove the unused profile-picture column (`20261026173014_remove_user_picture`), create the presentation table (`20261026193020_create_presentation_table`), create the sentence table (`20261027052508_create_sentence_table`), and create the vocabulary table (`20261027062356_create_vocabulary_table`). After any schema change:

```bash
npx prisma generate
npx prisma migrate dev --name <migration-name>
```

All entity IDs follow the project convention: `String @id @default(uuid())`.

---

## 5. Project Structure

```text
src/
├── app/
│   ├── page.tsx                 # Home page
│   ├── presentation/page.tsx    # Presentation library (Server Component + Suspense)
│   ├── presentation/[id]/page.tsx # Presentation practice (server read + read-only workspace)
│   ├── sentences/page.tsx       # Sentence library (Server Component + Suspense)
│   ├── vocabulary/page.tsx      # Vocabulary library (Server Component + Suspense)
│   ├── practice/page.tsx        # Practice page
│   ├── admin-register/page.tsx  # Hidden admin registration page
│   ├── api/auth/                # register, login, Google login, profile, complete-profile, admin, logout
│   ├── api/presentations/       # list plus admin-only create/update/delete handlers
│   ├── api/sentences/           # list plus admin-only create/update/delete handlers
│   ├── api/vocabulary/          # list plus admin-only create/update/delete handlers
│   ├── layout.tsx               # Root layout — fonts, metadata, providers, AppLayoutShell
│   ├── globals.css              # Tailwind import, theme variables, scrollbars
│   └── not-found.tsx            # 404 page
├── components/
│   ├── features/                # Page-level sections, one folder per page
│   │   ├── auth/
│   │   ├── home/
│   │   ├── presentation/
│   │   ├── practice/
│   │   ├── sentence/
│   │   └── vocabulary/
│   ├── shared/                  # AppLayoutShell, Sidebar, Navbar, UserMenu, Footer
│   └── ui/                      # Reusable primitives (buttons, inputs, tables, ...)
├── features/
│   ├── auth/                    # AuthProvider, auth modals/forms, Google button, fetch helper
│   ├── presentation/            # Actions, Filters, Section, Table, practice workspace, form modal, fetch helper
│   ├── sentence/                # Actions, Filters, Section, Table, expandable practice panel, form modal, fetch helper
│   ├── vocabulary/              # Actions, Filters, Section, Table, expandable practice panel, form modal, fetch helper
│   └── practice/
│       ├── PracticeWorkspace.tsx # Editable text island (localStorage-backed)
│       ├── useSpeechPractice.ts  # Advanced IPA, accent, speed and speech state
│       ├── SpeechPracticeControls.tsx # Advanced accent/speed/IPA and playback controls
│       ├── IpaTranscriptionCard.tsx   # Advanced IPA transcription card
│       ├── useIpaTranscription.ts     # Automatic dialect-aware inline IPA
│       ├── InlineIpa.tsx              # Renders IPA beneath any English item
│       ├── useListenSpeech.ts         # Listen-only accent, speed and playback state
│       ├── ListenControls.tsx         # Accent + speed dropdowns for inline panels
│       └── PlayTextButton.tsx         # Per-item Listen button
├── lib/
│   ├── auth/                    # JWT signing/verification, cookies, bcrypt helpers
│   ├── validations/             # Zod request schemas
│   ├── api-error.ts             # ApiError + shared route error formatting
│   ├── prisma.ts                # PrismaClient singleton with @prisma/adapter-pg
│   └── utils.ts                 # Date, currency and pagination helpers
├── server/
│   ├── repositories/            # Prisma data access for users, refresh tokens, presentations, sentences, and vocabulary
│   ├── services/                # Auth, session resolution, presentation, sentence, and vocabulary workflows
│   └── types/                   # Server-side payload and pagination interfaces
├── types/                       # Client-facing view-model types
└── generated/prisma/            # Generated Prisma client (gitignored)
```

---

## 6. Layout & Navigation

The shell is composed in `src/app/layout.tsx` and `src/components/shared/AppLayoutShell.tsx`:

- `AppLayoutShell` is a client component that owns the mobile sidebar open/closed state.
- `Sidebar` renders the fixed desktop rail plus the mobile drawer, sharing one `navItems` list. It is wrapped in a `<Suspense>` boundary with a width-preserving fallback because `usePathname()` must suspend while a dynamic route is prerendered.
- `Navbar` is the fixed header. It keeps the mobile hamburger on the left and renders the auth area on the right: a loading placeholder, **Login** / **Register** buttons, or the `UserMenu` account dropdown when signed in. The login, register, and complete-profile modals are mounted alongside it.
- `main` offsets itself with `pt-[var(--app-nav-height)]` so the fixed header never overlaps content.
- `Footer` sits at the bottom of the main column.

Active sidebar items use the established styling: `bg-indigo-50 text-indigo-700 font-semibold` with an indigo icon.

---

## 7. Authentication

Pages are public: **no page route is guarded or redirected**. Signed-out visitors can browse every screen; signing in adds the account menu and unlocks the account API. The only role checks are server-side admin checks on presentation, sentence, and vocabulary mutations. The session flow uses a short-lived access JWT, a rotating refresh token in PostgreSQL, and direct service calls from route handlers.

### Session model

- **Access token** — HS512 JWT, 30 minutes, stored in the `accessToken` httpOnly cookie.
- **Refresh token** — HS512 JWT, 7 days, stored in the `refreshToken` httpOnly cookie. Only its SHA-256 hash is persisted in `RefreshToken`.
- **Rotation** — `resolveSessionUser` verifies the access token first; when it expires, the refresh token is validated against the database, rotated, and both cookies are reissued.
- **Reuse detection** — a refresh token used again after the 30-second grace period deletes all of that user's refresh tokens, invalidating every session.
- **Cookie flags** — `httpOnly`; `sameSite=lax` in development and `secure` + `sameSite=none` in production.
- **Passwords** — bcrypt with `HASH_SALT_ROUNDS` (default `10`); Google-only accounts have no password until they complete their profile.

### API routes

All handlers return `{ success, message, data }` (or `{ success: false, message }` on error), validate input with Zod, and call `src/server/services/auth.service.ts` directly — there is no internal HTTP hop.

| Method | Route | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a public account with name, email, and password |
| `POST` | `/api/auth/login` | Email/password sign-in; sets the auth cookies |
| `POST` | `/api/auth/login-google` | Exchange a Google access token for a session via the Google userinfo endpoint |
| `GET` | `/api/auth/profile` | Return the signed-in user, or `401` when signed out |
| `PATCH` | `/api/auth/complete-profile` | Set a password for an incomplete account and reissue the session |
| `POST` | `/api/auth/register-admin` | Create an admin account; requires the private `ADMIN_REGISTER_KEY` |
| `POST` | `/api/auth/logout` | Delete the user's refresh tokens and clear both cookies |

### UI behavior

- `AuthProvider` (`src/features/auth/AuthProvider.tsx`) owns the current user, loading state, and which auth modal is open. It fetches `/api/auth/profile` on mount; a `401` simply leaves the visitor signed out.
- The header shows **Login** and **Register** buttons when signed out and the `UserMenu` dropdown with the account's initial badge when signed in. The menu displays the account, a *Complete your profile* action for Google accounts without a password, and logout.
- Login, register, and complete-profile are modal flows sharing the `Button`, `Input`, and `Modal` primitives. Registering succeeds with a notice and switches to the login modal; it does not sign the user in.
- Google accounts that have not set a password land on `isComplete: false`, and the user menu prompts them to complete the profile. Completing it stores a bcrypt password, sets `isComplete: true`, and reissues the session.
- The header badge shows the first letter of the user's name; the app does not use profile pictures.

### Google sign-in setup

Google sign-in uses the implicit flow through `@react-oauth/google`: the browser obtains an access token, and `/api/auth/login-google` calls `https://www.googleapis.com/oauth2/v3/userinfo` to read the profile.

1. Create an OAuth 2.0 **Web application** client in Google Cloud Console.
2. Add `http://localhost:3000` to the authorized JavaScript origins. If you open the app through `127.0.0.1` or a LAN address, add that exact origin too.
3. While the OAuth consent screen is in **Testing**, add the Google account you sign in with as a test user.
4. Put the client ID in `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and restart the dev server — `NEXT_PUBLIC_*` values are read at startup.
5. Allow popups for `localhost:3000`; the popup-based implicit flow cannot complete if the browser blocks the Google window.
6. After a successful Google login, the API creates an incomplete account when the email is new and signs the user in.

While the client ID is empty the Google button renders disabled with a notice instead of failing at runtime. Popup-blocked and cancelled attempts are reported in the login form, and the button stays disabled until the Google script has loaded. Google login has not been exercised against real credentials in this repository; the API has only been verified to reject invalid tokens.

### Hidden admin registration

`/admin-register` is a standalone page that is **not linked from the sidebar** and sets `robots: { index: false, follow: false }`. It asks for name, email, password, confirmation, and the private admin secret key, then calls `/api/auth/register-admin`. The service compares the submitted key to `ADMIN_REGISTER_KEY` and returns `403` for a mismatch. Successful registration creates an `admin` user; it does not sign them in, so the form redirects to the home page and opens the login modal.

---

## 8. Presentation Library

`src/app/presentation/page.tsx` is a Server Component. It wraps `PresentationContent` in `<Suspense>`; that async component awaits `connection()`, reads the `search` and `page` search params, calls `listPresentations()` directly, and passes the rows, pagination meta, filters, and next sequence to the view. The initial read does not make an HTTP hop.

### Header, search, and table

- The header combines the **Presentation** title, a subtitle, and the admin-only **New presentation** button.
- A debounced search input filters on the presentation title. Search and page state live in URL search params (`search`, `page`), so the list stays server-rendered.
- The table shows **sequence**, **title** with a text preview capped at 100 characters (a `...` suffix marks truncated text), and a **Practice now** link to `/presentation/[id]` for every row.
- Admins additionally see per-row edit/delete icon buttons; the edit action uses the same `FiEdit` icon as the reference student page. Everyone else sees the list and practice links only.
- The list shows 20 rows per page by default and renders the shared `Pagination` primitive with the total count.
- Create and edit share `PresentationFormModal`. It validates the fields and calls `POST /api/presentations` or `PATCH /api/presentations/:id`.
- Delete asks for SweetAlert confirmation and calls `DELETE /api/presentations/:id`.
- After a successful mutation the client calls `router.refresh()` so the server-rendered table immediately reflects the change.

### Authorization

- Presentation pages remain public. Authorization is enforced in `src/server/services/presentation.service.ts`, not only in the UI.
- `requireAdminUser()` returns `401` when signed out and `403` for a `public` user. The create, update, and delete service methods all call it.
- UI gating uses `useAuth()` and `user?.role === "admin"`; hiding the controls is a convenience, not the security boundary.
- The page does not call `resolveSessionUser()` because that can write refreshed cookies, which is not allowed in a Server Component.

### Data rules and API

- Title: 1–200 characters. Text: 1–20,000 characters. Sequence: integer from 1 to 100,000.
- Sequence is not unique. Rows are ordered by `sequence` ascending, then `createdAt` ascending.
- Search runs as a case-insensitive title `contains` inside the Prisma `where`; `count` plus `skip`/`take` paginates the result.
- The form suggests the next sequence (`max(sequence) + 1`) from a server read, and admins can change it.

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/presentations` | Public | List presentations with `search`, `page`, and `pageSize` (default 20) |
| `POST` | `/api/presentations` | Admin | Create a presentation |
| `PATCH` | `/api/presentations/:id` | Admin | Update title, text, and sequence |
| `DELETE` | `/api/presentations/:id` | Admin | Delete a presentation |

`GET` returns `{ success: true, data: { items, pagination, nextSequence } }`. Mutation handlers validate with `presentationInputSchema` and return the shared `{ success, message, data }` shape.

### Practice route

`/presentation/[id]` reads one saved presentation on the server with `getPresentationById()`. It is a blocking route (`instant = false`) so an unknown id returns a real `404` instead of a streamed 200 status. The header shows a back link, the presentation title, and a short subtitle. `PresentationPracticeWorkspace` then displays the saved text in a read-only panel capped at `max-h-96` with vertical scrolling and preserved line breaks; the same accent, speed, IPA, and speech controls as the Practice page sit underneath. The saved text is never edited or persisted from this page.

---

## 9. Sentence Library

`src/app/sentences/page.tsx` mirrors the Presentation composition. It wraps `SentenceContent` in `<Suspense>`; that async component awaits `connection()`, reads the `search` and `page` search params, calls `listSentences()` directly, and passes the rows, pagination meta, filters, and next sequence to the view. Sentences deliberately have **no** detail route — a single sentence takes seconds to practice, so the practice panel expands inside the table instead.

### Header, search, and table

- The header combines the **Sentences** title, a subtitle, and the admin-only **New sentence** button.
- A debounced search matches both the English sentence and the Bengali meaning. Search and page live in URL search params (`search`, `page`), so the list stays server-rendered.
- The table shows **sequence**, the English sentence with the Bengali meaning beneath it (capped at two lines), a **Practice** / **Hide** toggle, and admin-only edit/delete actions.
- The practice toggle carries `aria-expanded` and `aria-controls`. Only one row can be expanded: `SentenceSection` owns a single `expandedId`, so opening another row collapses the current one automatically, and changing the page or search clears it.
- `DataTable` accepts `expandedRowId` and `renderExpandedRow`; the expanded panel renders in a full-width `colSpan` row directly beneath its sentence.
- The list shows 20 rows per page by default and renders the shared `Pagination` primitive with the total count.
- Create and edit share `SentenceFormModal` (English sentence, Bengali meaning, sequence) and call `POST /api/sentences` or `PATCH /api/sentences/:id`. Delete asks for SweetAlert confirmation and calls `DELETE /api/sentences/:id`. After a successful mutation the client calls `router.refresh()`.

### Inline practice panel

`SentencePracticePanel` is deliberately simpler than the Practice workspace. It shows the English sentence with its IPA transcribed automatically beneath it, a per-sentence **Listen** button, the Bengali meaning in a bordered **Meaning (বাংলা)** block rendered with `lang="bn"`, and `ListenControls`, which offers only **Accent** and **Speed**. There is no pause, reset, IPA toggle, or IPA view dropdown — the learner picks an accent and speed, then listens. The panel never reads or writes the Practice page's `localStorage` entry, and switching rows unmounts it, which cancels playback.

Because the panel lives inside a table row, the shared `Dropdown` renders its menu through a portal into `document.body` with fixed, viewport-clamped positioning (flipping above the trigger when there is no room below and closing on Escape or outside click). This keeps the accent and speed menus fully visible instead of being clipped by the table's scroll container.

### Authorization and API

- Sentence pages remain public; authorization is enforced in `src/server/services/sentence.service.ts`, not only in the UI.
- `requireAdminUser()` returns `401` when signed out and `403` for a `public` user. Create, update, and delete all call it; UI gating with `useAuth()` is a convenience, not the security boundary.
- The page does not call `resolveSessionUser()` because that can write refreshed cookies, which is not allowed in a Server Component.

### Data rules

- Text: 1–1000 characters (trimmed). Meaning: 1–1000 characters (trimmed). Sequence: integer from 1 to 100,000.
- Sequence is not unique. Rows are ordered by `sequence` ascending, then `createdAt` ascending.
- Search runs as a case-insensitive `contains` over `text` **or** `meaning` inside the Prisma `where`; `count` plus `skip`/`take` paginates the result.
- The form suggests the next sequence (`max(sequence) + 1`) from a server read, and admins can change it.

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sentences` | Public | List sentences with `search`, `page`, and `pageSize` (default 20) |
| `POST` | `/api/sentences` | Admin | Create a sentence with text, meaning, and sequence |
| `PATCH` | `/api/sentences/:id` | Admin | Update text, meaning, and sequence |
| `DELETE` | `/api/sentences/:id` | Admin | Delete a sentence |

`GET` returns `{ success: true, data: { items, pagination, nextSequence } }`. Mutation handlers validate with `sentenceInputSchema` and return the shared `{ success, message, data }` shape; a missing record returns `404` with "Sentence is not found."

---

## 10. Vocabulary Library

`src/app/vocabulary/page.tsx` follows the same server-rendered composition as Sentences. `VocabularyContent` awaits `connection()`, reads the `search`, `letter`, and `page` search params, calls `listVocabulary()` directly, and passes the rows, pagination meta, filters, and next sequence to the view. Vocabulary has **no** detail route; the practice panel expands inside the table.

Each vocabulary row stores a word, its Bengali meaning, an example sentence with its Bengali meaning, and an optional synonym group and optional antonym group. Every synonym/antonym field is optional, and a group only appears in the practice panel when its word is present.

### Header, filters, and table

- The header combines the **Vocabulary** title, a subtitle, and the admin-only **New word** button.
- Search is debounced and applies **only** to the word, synonym, and antonym text — it never matches Bengali meanings or sentences.
- An **A–Z dropdown** filters words by their first letter (`All letters` plus A–Z). The letter is normalized to a single uppercase character on the server, and search and letter filters combine.
- Search, letter, and page state live in URL search params (`search`, `letter`, `page`), so the list stays server-rendered.
- The table shows **sequence**, the word with its Bengali meaning beneath it (and a mobile-only IPA line), an **IPA** column for the word (hidden below `sm`), a **Practice** / **Hide** toggle, and admin-only edit/delete actions.
- Only one row can be expanded: `VocabularySection` owns a single `expandedId`, so opening another row collapses the current one, and changing the page or filters clears it. `DataTable` renders the panel in a full-width `colSpan` row.
- Create and edit share `VocabularyFormModal`; required fields are the word, Bengali meaning, example sentence, example sentence meaning, and sequence, while the synonym and antonym groups are optional. Blank optional groups are submitted as `null`. Delete uses SweetAlert confirmation. After a successful mutation the client calls `router.refresh()`.

### Inline practice panel

`VocabularyPracticePanel` is listen-only and self-explanatory. The top row shows the word — slightly larger, left-aligned — with `ListenControls` (**Accent** and **Speed** only, right-aligned in one row) on wide screens; on mobile it stacks into three rows: word, accent, speed. There is no pause, reset, IPA toggle, or IPA view dropdown.

Every item is an entry card: the word, example sentence, synonym word, synonym sentence, antonym word, and antonym sentence. Each card appears only when its field exists, and each shows the English text, its IPA transcribed automatically beneath it, a Bengali meaning with `lang="bn"`, and its own **Listen** button. On wide screens the grid places each word beside its corresponding sentence — word next to example sentence, synonym next to synonym sentence, antonym next to antonym sentence — and below that breakpoint the cards stack in reading order. The IPA follows the selected accent and recomputes when the accent changes. Switching rows unmounts the panel, which cancels playback.

### Authorization and API

- Vocabulary pages remain public; authorization is enforced in `src/server/services/vocabulary.service.ts`, not only in the UI.
- `requireAdminUser()` returns `401` when signed out and `403` for a `public` user. Create, update, and delete all call it; UI gating with `useAuth()` is a convenience, not the security boundary.
- The page does not call `resolveSessionUser()` because that can write refreshed cookies, which is not allowed in a Server Component.

### Data rules

- Word: 1–100 characters. Bengali meaning: 1–500. Example sentence and its Bengali meaning: 1–1000. Sequence: integer from 1 to 100,000.
- Optional synonym and antonym fields accept missing or `null` values and are stored as `null` when blank. A synonym or antonym detail without its word is rejected.
- Sequence is not unique. Rows are ordered by `sequence` ascending, then `createdAt` ascending.
- Search runs as a case-insensitive `contains` over `text`, `synonymText`, **or** `antonymText` inside the Prisma `where`. The letter filter is a case-insensitive `startsWith` on `text`. `count` plus `skip`/`take` paginates the result.
- The form suggests the next sequence (`max(sequence) + 1`) from a server read, and admins can change it.

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vocabulary` | Public | List words with `search`, `letter`, `page`, and `pageSize` (default 20) |
| `POST` | `/api/vocabulary` | Admin | Create a word with its meanings, examples, optional synonym/antonym, and sequence |
| `PATCH` | `/api/vocabulary/:id` | Admin | Update any vocabulary field |
| `DELETE` | `/api/vocabulary/:id` | Admin | Delete a vocabulary row |

`GET` returns `{ success: true, data: { items, pagination, nextSequence } }`. Mutation handlers validate with `vocabularyInputSchema` and return the shared `{ success, message, data }` shape; a missing record returns `404` with "Vocabulary is not found."

---

## 11. Practice Workspace

`src/features/practice/PracticeWorkspace.tsx` is the editable client island embedded by the Practice page. The advanced IPA and speech behavior lives in `useSpeechPractice.ts` and is rendered by `SpeechPracticeControls` and `IpaTranscriptionCard`; `src/features/presentation/PresentationPracticeWorkspace.tsx` reuses all three with saved text. The Sentence and Vocabulary libraries instead use the listen-only `useIpaTranscription`, `InlineIpa`, `useListenSpeech`, `PlayTextButton`, and `ListenControls`, where IPA appears automatically below every item and the learner only chooses accent and speed.

- **English text** — a textarea for the text to practice; speech and IPA both follow its current value. The presentation page instead shows the saved text in a scrollable read-only panel; the Sentence and Vocabulary libraries show saved items inside expanded rows.
- **Accent dropdown** — British English (`en-GB`) or American English (`en-US`).
- **Speed dropdown** — `0.5×` through `1.5×`, applied to the utterance's `rate`. Changing speed during playback stops speech and asks you to press Start again.
- **Show IPA translation** — computes a dialect-aware IPA transcription. The `phonemize` package is loaded on demand, so its pronunciation data is not part of the initial page bundle.
- **IPA view dropdown** — switches between *Sentence by sentence*, where each sentence is paired with its own IPA line in a separated card, and *Full translation*, a single continuous transcription block. Sentences are found with `Intl.Segmenter`, with abbreviation handling for forms such as `Mr.`, `Dr.`, and `Jan.`, so manual line breaks are not required.
- **Start / Resume** — starts speech in the selected accent and speed, or resumes a paused utterance.
- **Pause** — pauses the active utterance; Start changes to Resume while paused.
- **Reset** — cancels playback, clears the pause state, and returns the status to ready.

The workspace uses a responsive card layout: controls and action buttons stack on phones, the control grid becomes two columns on tablets (`sm`) and three on wide screens (`xl`), and nothing overflows horizontally at 390 px, 768 px, or 1440 px.

Speech playback uses `window.speechSynthesis`. Available voices come from the operating system and browser. If no voice matches the selected accent, the app falls back to the browser's default English voice and displays a notice. On the Practice page only, the text is saved to `localStorage` (`spoken-english-practice:text`) as you type and restored on reload; emptying the textarea removes the saved entry. IPA and audio remain session-only, audio never leaves the browser, and nothing is written to the database.

---

## 12. Shared UI Primitives

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

`DataTable` also supports single-row expansion via optional `expandedRowId` and `renderExpandedRow` props (used by the Sentence and Vocabulary libraries). `Dropdown` portal-renders its menu into `document.body` with fixed, viewport-aware positioning so it is never clipped by table scroll containers.

---

## 13. Quality Gates

| Check | Command | Current Result |
| :--- | :--- | :--- |
| Lint | `npm run lint` | 0 errors, 1 known `react-hooks/exhaustive-deps` warning in `SearchInput` |
| Types | `npx tsc --noEmit` | Clean |
| Build | `npm run build` | Clean — `/`, `/practice`, `/admin-register`, and `/_not-found` prerender statically; `/presentation`, `/sentences`, and `/vocabulary` are partial prerenders; `/presentation/[id]` is a blocking dynamic route; API routes are dynamic |

Pages without request data remain fully static. The Presentation, Sentences, and Vocabulary pages stream their database reads through `<Suspense>` and call `connection()` inside that boundary, so the shell is prerendered while the rows arrive per request. `/api/auth/profile` awaits `connection()` before reading cookies so it is always evaluated per request. The sidebar's `usePathname()` is wrapped in `<Suspense>` with a width-preserving fallback so dynamic routes can prerender their shell.
