# Spoken English Practice

A full-stack **Spoken English Practice** application built with **Next.js 16 (App Router & Turbopack)**, **TypeScript**, **Tailwind CSS v4**, **PostgreSQL**, and **Prisma ORM 7** with the `@prisma/adapter-pg` driver.

This repository contains the **layout-first foundation**, the **Presentation library**, the inline **Sentence library**, the inline **Vocabulary library**, the **Conversation library**, the interactive **Practice workspace**, and cookie-based **authentication**: the application shell, navigation, shared UI primitives, database wiring, an admin-managed collection of saved presentation texts, a sentence library with Bengali meanings that expands for practice in place, a vocabulary library with Bengali meanings, example sentences, synonyms, antonyms, and automatic IPA, a two-speaker conversation library whose turns are reordered by drag and drop and played back with a different voice per speaker, client-side IPA and speech playback, and email/password plus Google sign-in. IPA transcription is provided by `phonemize`; voice playback uses the browser Web Speech API; drag and drop uses `@dnd-kit`; sessions use HS512 JWTs with rotating refresh tokens stored in PostgreSQL.

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
11. [Conversation Library](#11-conversation-library)
12. [Practice Workspace](#12-practice-workspace)
13. [Shared UI Primitives](#13-shared-ui-primitives)
14. [Quality Gates](#14-quality-gates)

---

## 1. Current Scope

The application currently ships the shared application shell and its portal pages:

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | Home | Landing page with the library totals and navigation into every practice area |
| `/presentation` | Daily Presentations | Admin-managed library of saved titles and practice texts |
| `/presentation/[id]` | Presentation Practice | Read-only practice for one saved presentation: title, scrollable text, IPA, and speech |
| `/sentences` | Common sentences | Admin-managed sentence library with Bengali meanings and inline, single-row practice |
| `/vocabulary` | Important Vocabularies | Admin-managed word library with Bengali meanings, example sentences, synonyms, antonyms, automatic IPA, and inline practice |
| `/conversations` | Regular conversation | Admin-managed library of two-speaker dialogues: title, speaker names, description, and ordered turns |
| `/conversations/[id]` | Conversation Practice | Practice for one saved conversation: named turns, one shared accent with a voice per speaker, IPA, and chained two-voice playback |
| `/practice` | Live practice | Interactive text, IPA, and speech workspace |
| `/admin-register` | Admin Registration | Hidden form for creating an admin with the private secret key |

Every page `<h1>` repeats its sidebar label, so the sidebar and the page heading always say the same thing; Home lists four of those destinations. Routes keep their original paths.

Home is the landing page: a gradient hero with the two primary calls to action, four live totals (Learners, Important Vocabularies, Common sentences, Daily Presentations), and a card for each destination — vocabulary, sentences, presentations, practice. The hero prerenders while the totals stream from the database, so the route stays a partial prerender. Those totals stay unfiltered `COUNT`s of everything saved — drafts included — because Home is deliberately left alone; only the four library lists and their practice routes apply the published/draft rule. **Regular conversation** is in the sidebar but deliberately not on Home yet: no conversation total and no conversation card. The top header shows **Login** and **Register** actions on the right; once signed in, they are replaced by a user menu with the account name, email, update profile and update password actions, complete-profile action when needed, and logout. Pages remain public — authentication changes the header controls, and only presentation, sentence, vocabulary, and conversation mutations are restricted to admins.

**What is already in place**

- Fixed desktop sidebar (`w-72`, wide enough for the longest nav label) with active-state styling and `react-icons`.
- Both sidebars lead with the logo in `public/spoken-english.jpg` beside the title, and the same file is the browser-tab icon via `metadata.icons`.
- Mobile slide-in sidebar drawer (`w-64`) with backdrop and close control.
- Fixed top header shell that reserves its height with `--app-nav-height` and hosts the auth controls.
- Full-width main content viewport with the established padding rhythm (`p-6 md:p-8`).
- Shared footer.
- Tailwind CSS v4 theme, custom scrollbars, and horizontal-overflow guard.
- Prisma 7 schema with `User`, `RefreshToken`, `Presentation`, `Sentence`, `Vocabulary`, `Conversation`, and `ConversationLine` models, PostgreSQL datasource, Prisma client singleton, and a `.env` connection string.
- Published/draft visibility on all four libraries: an admin sees every row and can filter or switch a row between **Published** and **Draft** from its modal, while a signed-in public user and a signed-out visitor only ever see published rows. Vocabulary rows additionally store a `partsOfSpeech` enum value (noun by default) that admins set from the word modal.
- The reusable `components/ui` primitive library, ready for use by upcoming features.
- A Home landing page with a gradient hero, four live totals (learners, presentations, sentences, vocabulary), and cards that link into every practice area.
- A Presentation library with a server-rendered, searchable, paginated table; admin-only create/update modals and delete confirmation; and a per-row **Practice now** link into the dynamic route.
- A Sentence library with a searchable, paginated table, admin-only create/edit/delete, and an inline practice panel that expands one row at a time with the English sentence, automatic IPA beneath it, Bengali meaning, per-sentence Listen, and accent, voice and speed controls.
- A Vocabulary library with a searchable, paginated table, an initial-letter filter, admin-only create/edit/delete, and an inline practice panel showing automatic IPA and Listen for the word, example sentence, and each optional synonym and antonym.
- A Conversation library with a searchable, paginated table of two-speaker dialogues, an admin-only editor whose turns reorder by drag and drop or keyboard, and a practice page that speaks every turn in one shared accent with a voice of its own per speaker, while showing their names as labels only.
- A Practice workspace with English text input, sentence-by-sentence or full IPA transcription, and browser speech playback with accent, voice and speed controls.
- Email/password registration and login, Google login, complete-profile flow, update profile (name) and update password from the user menu, hidden admin registration, logout, and rotating refresh-token sessions.

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

4. **Apply the migrations** (creates the `users`, `refresh_tokens`, `presentation`, `sentence`, `vocabulary`, `conversation`, and `conversation_line` tables):
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
   `npm run build` runs `prisma generate && next build`. The generated client lives in the gitignored `src/generated/prisma`, so a fresh clone or CI machine (Vercel, GitHub Actions) must generate it as part of the build command — a bare `next build` fails there with `Module not found: Can't resolve '@/generated/prisma/client'`. `prisma generate` needs no database connection, so it works even before `DATABASE_URL` is set.

---

## 3. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma with `@prisma/adapter-pg`. Any `sslmode` / `sslrootcert` parameters are consumed in code — see [Database Setup](#4-database-setup) | `postgres://postgres:password@localhost:5432/spoken_english_practice?schema=public` |
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
- **TLS**: hosted providers such as Aiven require their root CA. `src/lib/aiven-ca.ts` embeds it, and `src/lib/prisma.ts` strips `sslmode` and `sslrootcert` from `DATABASE_URL` before handing the string to `pg`. A file path cannot work in production: a serverless bundle only contains traced files, so `sslrootcert=certs/ca.pem` resolves against the function's working directory and throws `ENOENT: no such file or directory, open 'certs/ca.pem'` on the first query. `certs/ca.pem` stays committed for the Prisma CLI, which only understands the path form.
- **Configuration**: `prisma.config.ts` loads `.env` via `dotenv/config` and supplies the datasource URL

The schema declares the authentication, presentation, sentence, vocabulary, and conversation models:

- `User` — UUID id, unique email, optional bcrypt password, `admin` / `public` role, `isComplete`, and timestamps. Google-created users start with `isComplete: false` until they set a password.
- `RefreshToken` — UUID id, unique SHA-256 hash of the refresh JWT, owning user (cascade delete), `used` / `usedAt` for rotation, and `expiresAt`.
- `Presentation` — UUID id, unique title, practice text, integer `sequence`, `isPublished`, and timestamps. The list index is the composite `(sequence, createdAt)`, so rows ordered by `sequence` ascending and then `createdAt` ascending are served without a sort.
- `Sentence` — UUID id, unique English `text`, Bengali `meaning`, integer `sequence`, `isPublished`, and timestamps, indexed on `(sequence, createdAt)`. Rows are ordered by `sequence` ascending and then `createdAt` ascending.
- `Vocabulary` — UUID id, required and unique word `text`, Bengali `meaning`, example `sentence` and `sentenceMeaning`, nullable synonym fields (`synonymText`, `synonymMeaning`, `synonymSentence`, `synonymSentenceMeaning`), nullable antonym fields with the same shape, integer `sequence`, `isPublished`, a `partsOfSpeech` value from the `PartsOfSpeech` enum, and timestamps, indexed on `(sequence, createdAt)`. Rows are ordered by `sequence` ascending and then `createdAt` ascending.
- `Conversation` — UUID id, unique `title` (what the conversation is about), `speaker1` and `speaker2` (the two display names), `description`, integer `sequence`, `isPublished`, and timestamps, indexed on `(sequence, createdAt)`.
- `ConversationLine` — UUID id, `conversationId` (relation with `onDelete: Cascade`), turn `text`, integer `sequence`, and timestamps, indexed on `(conversationId, sequence)`. The line's speaker is **derived**, not stored: `sequence % 2 === 1` is speaker 1, otherwise speaker 2, so the turns always alternate.

Uniqueness is exact-match: `text` and `title` are compared verbatim, so a case or whitespace variant is a separate row. Each create and update maps a Prisma `P2002` to a `409` with a learner-facing message, which the form modal renders inline.

### Publishing and part of speech

Every library row carries `isPublished Boolean @default(true)`. An admin sees and edits both states; a signed-in public user and a signed-out visitor see published rows only — in the tables, in the detail and practice routes, and in the Previous/Next neighbour walks. `src/lib/publishing.ts` holds the single rule that turns a `{ status, canViewUnpublished }` view into a Prisma `where`, and it fails closed: without an admin role the predicate is `isPublished = true`, so a hand-typed `?status=draft` reveals nothing.

`PartsOfSpeech` is a PostgreSQL enum with the eight school-standard values — `noun`, `verb`, `adjective`, `adverb`, `pronoun`, `preposition`, `conjunction`, `interjection` — and defaults to `noun`.

The migration `20261104055301_add_publishing_and_parts_of_speech` is purely additive: one `CREATE TYPE` plus four `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT` statements. Every existing row was backfilled as published with part of speech `noun`, and nothing was rewritten or dropped. No index was added on `isPublished` — it is a two-value flag, and the repo only declares indexes the Prisma schema can express.

The migrations create the users and refresh tokens (`20261026161057_create_user_and_refresh_token_tables`), remove the unused profile-picture column (`20261026173014_remove_user_picture`), create the presentation table (`20261026193020_create_presentation_table`), create the sentence table (`20261027052508_create_sentence_table`), create the vocabulary table (`20261027062356_create_vocabulary_table`), and add the unique keys plus the composite list indexes while dropping the redundant single-column ones (`20261028103000_add_unique_keys_and_list_indexes`), and create the conversation and conversation_line tables with their cascade relation and indexes (`20261103205610_add_conversation_library`), and add the publishing flag plus the part-of-speech enum (`20261104055301_add_publishing_and_parts_of_speech`). After any schema change:

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
│   ├── page.tsx                 # Home landing page (hero + Suspense-streamed totals)
│   ├── presentation/page.tsx    # Presentation library (Server Component + Suspense)
│   ├── presentation/[id]/page.tsx # Presentation practice (server read + read-only workspace)
│   ├── sentences/page.tsx       # Sentence library (Server Component + Suspense)
│   ├── vocabulary/page.tsx      # Vocabulary library (Server Component + Suspense)
│   ├── conversations/page.tsx   # Conversation library (Server Component + Suspense)
│   ├── conversations/[id]/page.tsx # Conversation practice (server read + two-speaker workspace)
│   ├── practice/page.tsx        # Practice page
│   ├── admin-register/page.tsx  # Hidden admin registration page
│   ├── api/auth/                # register, login, Google login, profile, complete-profile, update-profile, update-password, admin, logout
│   ├── api/presentations/       # list plus admin-only create/update/delete handlers
│   ├── api/sentences/           # list plus admin-only create/update/delete handlers
│   ├── api/vocabulary/          # list plus admin-only create/update/delete handlers
│   ├── api/conversations/       # list plus admin-only create/update/delete handlers
│   ├── layout.tsx               # Root layout — fonts, metadata, providers, AppLayoutShell
│   ├── globals.css              # Tailwind import, theme variables, scrollbars
│   └── not-found.tsx            # 404 page
├── components/
│   ├── features/                # Page-level sections, one folder per page
│   │   ├── auth/
│   │   ├── conversation/        # ConversationView, ConversationContent + ConversationLoading, ConversationPracticeNav
│   │   ├── home/                # HomeHeader, HomeContent + HomeLoading, HomeView
│   │   ├── presentation/
│   │   ├── practice/
│   │   ├── sentence/
│   │   └── vocabulary/
│   ├── shared/                  # AppLayoutShell, Sidebar, Navbar, UserMenu, Footer
│   └── ui/                      # Reusable primitives (buttons, inputs, tables, ...)
├── features/
│   ├── auth/                    # AuthProvider, auth modals/forms, Google button, fetch helper
│   ├── conversation/            # Actions, Filters, Section, Table, form modal, dnd-kit turn sorter, two-voice hook, controls, IPA card, workspace, fetch helper
│   ├── presentation/            # Actions, Filters, Section, Table, practice workspace, form modal, fetch helper
│   ├── sentence/                # Actions, Filters, Section, Table, expandable practice panel, form modal, fetch helper
│   ├── vocabulary/              # Actions, Filters, Section, Table, expandable practice panel, form modal, fetch helper
│   └── practice/
│       ├── PracticeWorkspace.tsx # Editable text island (localStorage-backed)
│       ├── useSpeechPractice.ts  # Advanced IPA, accent, voice, speed and speech state
│       ├── SpeechPracticeControls.tsx # Advanced accent/voice/speed/IPA and playback controls
│       ├── IpaTranscriptionCard.tsx   # Advanced IPA transcription card
│       ├── useIpaTranscription.ts     # Automatic dialect-aware inline IPA
│       ├── InlineIpa.tsx              # Renders IPA beneath any English item
│       ├── useListenSpeech.ts         # Listen-only accent, voice, speed and playback state
│       ├── ListenControls.tsx         # Accent, voice and speed dropdowns for inline panels
│       ├── speechVoices.ts            # Shared accent-filtered voice list and gender label
│       └── PlayTextButton.tsx         # Per-item Listen button
├── lib/
│   ├── auth/                    # JWT signing/verification, cookies, bcrypt helpers
│   ├── validations/             # Zod request schemas
│   ├── api-error.ts             # ApiError + shared route error formatting
│   ├── prisma.ts                # PrismaClient singleton with @prisma/adapter-pg
│   ├── publishing.ts            # Published/draft visibility rule, filter options, and status parsing
│   └── utils.ts                 # Date, currency and pagination helpers
├── server/
│   ├── repositories/            # Prisma data access for users, refresh tokens, presentations, sentences, vocabulary, and conversations
│   ├── services/                # Auth, session resolution, home summary, presentation, sentence, vocabulary, and conversation workflows
│   └── types/                   # Server-side payload and pagination interfaces
├── types/                       # Client-facing view-model types
└── generated/prisma/            # Generated Prisma client (gitignored)
```

---

## 6. Layout & Navigation

The shell is composed in `src/app/layout.tsx` and `src/components/shared/AppLayoutShell.tsx`:

- `AppLayoutShell` is a client component that owns the mobile sidebar open/closed state.
- `Sidebar` renders the fixed desktop rail plus the mobile drawer, sharing one `navItems` list in this order: **Home**, **Important Vocabularies**, **Common sentences**, **Regular conversation**, **Daily Presentations**, **Live practice**. It is wrapped in a `<Suspense>` boundary with a width-preserving fallback because `usePathname()` must suspend while a dynamic route is prerendered.
- `Navbar` is the fixed header. It keeps the mobile hamburger on the left and renders the auth area on the right: a loading placeholder, **Login** / **Register** buttons, or the `UserMenu` account dropdown when signed in. The login, register, and complete-profile modals are mounted alongside it.
- `main` offsets itself with `pt-[var(--app-nav-height)]` so the fixed header never overlaps content.
- `Footer` sits at the bottom of the main column.

Active sidebar items use the established styling: `bg-indigo-50 text-indigo-700 font-semibold` with an indigo icon.

### Home landing page

`src/app/page.tsx` composes the landing screen in two parts so the route can still prerender its shell:

- `HomeHeader` is the static gradient hero — pill label, headline, benefit copy, and the **Start practicing free** (`/practice`) and **Explore the library** (`/vocabulary`) actions. `overflow-hidden` keeps its decorative blur from creating horizontal scroll.
- `HomeContent` awaits `connection()`, calls `getHomeSummary()`, and passes the totals to `HomeView`. `HomeLoading` is the skeleton `<Suspense>` fallback shipped in the initial HTML.
- `HomeView` renders four `StatCard` totals (Learners, Important Vocabularies, Common sentences, Daily Presentations) and four destination cards — `/vocabulary`, `/sentences`, `/presentation`, `/practice` — each titled with the same label the sidebar uses. **Regular conversation** is intentionally absent from both lists for now.
- Each total is one unfiltered `COUNT` in PostgreSQL and all four run in parallel; rows are never loaded to be counted. Home is server-rendered only, so there is no `/api/home` route.

---

## 7. Authentication

Pages are public: **no page route is guarded or redirected**. Signed-out visitors can browse every screen; signing in adds the account menu and unlocks the account API. The only role checks are server-side admin checks on presentation, sentence, vocabulary, and conversation mutations. The session flow uses a short-lived access JWT, a rotating refresh token in PostgreSQL, and direct service calls from route handlers.

### Session model

- **Access token** — HS512 JWT, 30 minutes, stored in the `accessToken` httpOnly cookie.
- **Refresh token** — HS512 JWT, 7 days, stored in the `refreshToken` httpOnly cookie. Only its SHA-256 hash is persisted in `RefreshToken`.
- **Rotation** — `resolveSessionUser` verifies the access token first; when it expires, the refresh token is validated against the database, rotated, and both cookies are reissued.
- **Read-only role lookup** — `resolveSessionRole()` and `canViewUnpublishedContent()` in `src/server/services/auth.service.ts` read the same cookies but never rotate a token or write a `Set-Cookie`, which is what lets the library Server Components ask "is this an admin?" safely. Anything other than an admin — including a broken or expired token — resolves to no privilege, so the published-only rule fails closed.
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
| `PATCH` | `/api/auth/update-profile` | Change the signed-in account's name and return the fresh user |
| `PATCH` | `/api/auth/update-password` | Verify the current password, store the new one, and reissue the session |
| `POST` | `/api/auth/register-admin` | Create an admin account; requires the private `ADMIN_REGISTER_KEY` |
| `POST` | `/api/auth/logout` | Delete the user's refresh tokens and clear both cookies |

### UI behavior

- `AuthProvider` (`src/features/auth/AuthProvider.tsx`) owns the current user, loading state, and which auth modal is open. It fetches `/api/auth/profile` on mount; a `401` simply leaves the visitor signed out.
- The header shows **Login** and **Register** buttons when signed out and the `UserMenu` dropdown with the account's initial badge when signed in. The menu displays the account, a *Complete your profile* action for Google accounts without a password, **Update profile**, **Update password**, and logout.
- Login, register, and complete-profile are modal flows sharing the `Button`, `Input`, and `Modal` primitives. Registering succeeds with a notice and switches to the login modal; it does not sign the user in.
- **Update profile** opens a modal with a single Name field and patches `/api/auth/update-profile`; the response replaces the cached user, so the header and menu show the new name without a reload. **Update password** opens a modal with Current password, New password, and Confirm password, patches `/api/auth/update-password`, and reissues the session on success. A wrong current password returns `401`, a mismatch returns `400`, and an account that only signs in with Google returns `400` because it has no password to verify. Both modals are owned by `UserMenu`, which mounts the form only while open so each visit starts clean.
- Every modal footer that has a submit and a cancel action places both buttons side by side at full modal width, with Cancel as the `secondary` variant.
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
- A debounced search input filters on the presentation title. Search, publication status, and page state live in URL search params (`search`, `status`, `page`), so the list stays server-rendered.
- The table shows **title** with a text preview capped at 30 characters (a `...` suffix marks truncated text), and a **Practice now** link to `/presentation/[id]` for every row. Sequence is stored and used for ordering but is not displayed.
- Admins additionally see per-row edit/delete icon buttons and a `warning` **Draft** `Badge` beside the title of any unpublished row; a `Published` / `Draft` / `All statuses` dropdown appears in the filter bar for them alone. Everyone else sees the published list and practice links only.
- The list shows 20 rows per page by default and renders the shared `Pagination` primitive with the total count.
- Create and edit share `PresentationFormModal`. Its fields are title, text, then a **Status** dropdown (`Published` / `Draft`, defaulting to Published), and sequence as the last input. It validates the fields and calls `POST /api/presentations` or `PATCH /api/presentations/:id`.
- Delete asks for SweetAlert confirmation and calls `DELETE /api/presentations/:id`.
- After a successful mutation the client calls `router.refresh()` so the server-rendered table immediately reflects the change.

### Authorization

- Presentation pages remain public. Authorization is enforced in `src/server/services/presentation.service.ts`, not only in the UI.
- `requireAdminUser()` returns `401` when signed out and `403` for a `public` user. The create, update, and delete service methods all call it.
- Reads resolve the role with `canViewUnpublishedContent()`, which only *reads* cookies — it never rotates a refresh token — so the Server Component may call it. Non-admins, including signed-out visitors, get the published rows.
- UI gating uses `useAuth()` and `user?.role === "admin"`; hiding the controls is a convenience, not the security boundary.
- The page does not call `resolveSessionUser()` because that can write refreshed cookies, which is not allowed in a Server Component.

### Data rules and API

- Title: 1–200 characters and unique. Text: 1–20,000 characters. Sequence: integer from 1 to 100,000. `isPublished` defaults to `true` when a payload omits it.
- Sequence is not unique. Rows are ordered by `sequence` ascending, then `createdAt` ascending, which the composite index serves without a sort.
- Saving a title another row already owns returns `409` with "A presentation with this title already exists."; editing a row while keeping its own title succeeds.
- Search runs as a case-insensitive title `contains` and the status rule runs as an `isPublished` predicate, both inside the Prisma `where`; `count` plus `skip`/`take` paginates the result.
- The form suggests the next sequence (`max(sequence) + 1`) from a server read, and admins can change it.

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/presentations` | Public | List published presentations with `search`, `status`, `page`, and `pageSize` (default 20); an admin session also sees drafts |
| `POST` | `/api/presentations` | Admin | Create a presentation |
| `PATCH` | `/api/presentations/:id` | Admin | Update title, text, sequence, and publication status |
| `DELETE` | `/api/presentations/:id` | Admin | Delete a presentation |

`GET` returns `{ success: true, data: { items, pagination, nextSequence } }`. Mutation handlers validate with `presentationInputSchema` and return the shared `{ success, message, data }` shape.

### Practice route

`/presentation/[id]` reads one saved presentation on the server with `getPresentationById()`. It is a blocking route (`instant = false`) so an unknown id returns a real `404` instead of a streamed 200 status. A draft id returns the same `404` to anyone who is not an admin, and the **Previous** / **Next** walk skips drafts for those readers, so a private row can never be reached by stepping sideways. The header shows a back link, the presentation title, and a short subtitle. `PresentationPracticeWorkspace` then displays the saved text in a read-only panel capped at `max-h-96` with vertical scrolling and preserved line breaks; the same accent, voice, speed, IPA, and speech controls as the Practice page sit underneath. The saved text is never edited or persisted from this page.

---

## 9. Sentence Library

`src/app/sentences/page.tsx` mirrors the Presentation composition. It wraps `SentenceContent` in `<Suspense>`; that async component awaits `connection()`, reads the `search` and `page` search params, calls `listSentences()` directly, and passes the rows, pagination meta, filters, and next sequence to the view. Sentences deliberately have **no** detail route — a single sentence takes seconds to practice, so the practice panel expands inside the table instead.

### Header, search, and table

- The header combines the **Sentences** title, a subtitle, and the admin-only **New sentence** button.
- A debounced search matches both the English sentence and the Bengali meaning. Search, publication status, and page live in URL search params (`search`, `status`, `page`), so the list stays server-rendered.
- The table shows the English sentence with the Bengali meaning beneath it (capped at two lines), a **Practice** / **Hide** toggle, and admin-only edit/delete actions. Sequence is not displayed, and admins also see a `warning` **Draft** badge beside an unpublished sentence plus the `All statuses` dropdown in the filter bar.
- The practice toggle carries `aria-expanded` and `aria-controls`. Only one row can be expanded: `SentenceSection` owns a single `expandedId`, so opening another row collapses the current one automatically, and changing the page or search clears it.
- `DataTable` accepts `expandedRowId` and `renderExpandedRow`; the expanded panel renders in a full-width `colSpan` row directly beneath its sentence.
- The list shows 20 rows per page by default and renders the shared `Pagination` primitive with the total count.
- Create and edit share `SentenceFormModal` (English sentence, Bengali meaning, **Status**, sequence) and call `POST /api/sentences` or `PATCH /api/sentences/:id`. Delete asks for SweetAlert confirmation and calls `DELETE /api/sentences/:id`. After a successful mutation the client calls `router.refresh()`.

### Inline practice panel

`SentencePracticePanel` is deliberately simpler than the Practice workspace. It shows the English sentence with its IPA transcribed automatically beneath it, a per-sentence **Listen** button, the Bengali meaning in a bordered **Meaning (বাংলা)** block rendered with `lang="bn"`, and `ListenControls`, which offers **Accent**, **Voice**, and **Speed**. There is no pause, reset, IPA toggle, or IPA view dropdown — the learner picks an accent, optionally a voice from that accent's list, and a speed, then listens. The panel never reads or writes the Practice page's `localStorage` entry, and switching rows unmounts it, which cancels playback.

Because the panel lives inside a table row, the shared `Dropdown` renders its menu through a portal into `document.body` with fixed, viewport-clamped positioning (flipping above the trigger when there is no room below and closing on Escape or outside click). This keeps the accent, voice, and speed menus fully visible instead of being clipped by the table's scroll container.

### Authorization and API

- Sentence pages remain public; authorization is enforced in `src/server/services/sentence.service.ts`, not only in the UI.
- `requireAdminUser()` returns `401` when signed out and `403` for a `public` user. Create, update, and delete all call it; UI gating with `useAuth()` is a convenience, not the security boundary.
- Reads resolve the role with `canViewUnpublishedContent()`, which only reads cookies, so the Server Component may call it. Non-admins see published sentences only.
- The page does not call `resolveSessionUser()` because that can write refreshed cookies, which is not allowed in a Server Component.

### Data rules

- Text: 1–1000 characters (trimmed) and unique. Meaning: 1–1000 characters (trimmed). Sequence: integer from 1 to 100,000. `isPublished` defaults to `true` when a payload omits it.
- Sequence is not unique. Rows are ordered by `sequence` ascending, then `createdAt` ascending, which the composite index serves without a sort.
- Saving a text another row already owns returns `409` with "A sentence with this text already exists."; editing a row while keeping its own text succeeds.
- Search runs as a case-insensitive `contains` over `text` **or** `meaning`, and the status rule as an `isPublished` predicate, both inside the Prisma `where`; `count` plus `skip`/`take` paginates the result.
- The form suggests the next sequence (`max(sequence) + 1`) from a server read, and admins can change it.

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sentences` | Public | List published sentences with `search`, `status`, `page`, and `pageSize` (default 20); an admin session also sees drafts |
| `POST` | `/api/sentences` | Admin | Create a sentence with text, meaning, sequence, and status |
| `PATCH` | `/api/sentences/:id` | Admin | Update text, meaning, sequence, and status |
| `DELETE` | `/api/sentences/:id` | Admin | Delete a sentence |

`GET` returns `{ success: true, data: { items, pagination, nextSequence } }`. Mutation handlers validate with `sentenceInputSchema` and return the shared `{ success, message, data }` shape; a missing record returns `404` with "Sentence is not found."

---

## 10. Vocabulary Library

`src/app/vocabulary/page.tsx` follows the same server-rendered composition as Sentences. `VocabularyContent` awaits `connection()`, reads the `search`, `letter`, and `page` search params, calls `listVocabulary()` directly, and passes the rows, pagination meta, filters, and next sequence to the view. Vocabulary has **no** detail route; the practice panel expands inside the table.

Each vocabulary row stores a word, its part of speech, its Bengali meaning, an example sentence with its Bengali meaning, and an optional synonym group and optional antonym group. Every synonym/antonym field is optional, and a group only appears in the practice panel when its word is present.

### Header, filters, and table

- The header combines the **Vocabulary** title, a subtitle, and the admin-only **New word** button.
- Search is debounced and applies **only** to the word, synonym, and antonym text — it never matches Bengali meanings or sentences.
- An **A–Z dropdown** filters words by their first letter (`All letters` plus A–Z). The letter is normalized to a single uppercase character on the server, and search and letter filters combine.
- Search, letter, publication status, and page state live in URL search params (`search`, `letter`, `status`, `page`), so the list stays server-rendered. The status dropdown is admin-only.
- The table shows the word with its Bengali meaning beneath it (and a mobile-only IPA line), the word's **part of speech** as a `neutral` badge under the word, an **IPA** column for the word (hidden below `sm`), a **Practice** / **Hide** toggle, and admin-only edit/delete actions. Sequence is not displayed, and admins also see a `warning` **Draft** badge beside an unpublished word.
- Only one row can be expanded: `VocabularySection` owns a single `expandedId`, so opening another row collapses the current one, and changing the page or filters clears it. `DataTable` renders the panel in a full-width `colSpan` row.
- Create and edit share `VocabularyFormModal`; required fields are the word, Bengali meaning, example sentence, and example sentence meaning, while the synonym and antonym groups are optional. **Part of speech** (the eight-value dropdown, default `noun`) and **Status** (`Published` / `Draft`) sit directly above the sequence input. Blank optional groups are submitted as `null`. Delete uses SweetAlert confirmation. After a successful mutation the client calls `router.refresh()`.

### Inline practice panel

`VocabularyPracticePanel` is listen-only and self-explanatory. The top row shows the word — slightly larger, left-aligned — with `ListenControls` (**Accent**, **Voice**, and **Speed**, right-aligned); the **Voice** list follows the selected accent and starts at `Automatic (best match)`. Those three dropdowns sit in one row from `lg` upwards, wrap two-up at `sm`, and stack one per row below the word on a phone. There is no pause, reset, IPA toggle, or IPA view dropdown.

Every item is an entry card: the word, example sentence, synonym word, synonym sentence, antonym word, and antonym sentence. Each card appears only when its field exists, and each shows the English text, its IPA transcribed automatically beneath it, a Bengali meaning with `lang="bn"`, and its own **Listen** button. On wide screens the grid places each word beside its corresponding sentence — word next to example sentence, synonym next to synonym sentence, antonym next to antonym sentence — and below that breakpoint the cards stack in reading order. The IPA follows the selected accent and recomputes when the accent changes. Switching rows unmounts the panel, which cancels playback.

### Authorization and API

- Vocabulary pages remain public; authorization is enforced in `src/server/services/vocabulary.service.ts`, not only in the UI.
- `requireAdminUser()` returns `401` when signed out and `403` for a `public` user. Create, update, and delete all call it; UI gating with `useAuth()` is a convenience, not the security boundary.
- Reads resolve the role with `canViewUnpublishedContent()`, which only reads cookies, so the Server Component may call it. Non-admins see published words only.
- The page does not call `resolveSessionUser()` because that can write refreshed cookies, which is not allowed in a Server Component.

### Data rules

- Word: 1–100 characters and unique. Bengali meaning: 1–500. Example sentence and its Bengali meaning: 1–1000. Sequence: integer from 1 to 100,000.
- `partsOfSpeech` is one of the eight `PartsOfSpeech` values and defaults to `noun` when a payload omits it; `isPublished` defaults to `true`.
- Optional synonym and antonym fields accept missing or `null` values and are stored as `null` when blank. A synonym or antonym detail without its word is rejected.
- Sequence is not unique. Rows are ordered by `sequence` ascending, then `createdAt` ascending, which the composite index serves without a sort.
- Search runs as a case-insensitive `contains` over `text`, `synonymText`, **or** `antonymText` inside the Prisma `where`. The letter filter is a case-insensitive `startsWith` on `text`, and the status rule adds the `isPublished` predicate. `count` plus `skip`/`take` paginates the result.
- Saving a word another row already owns returns `409` with "This vocabulary word is already saved."; editing a row while keeping its own word succeeds.
- The form suggests the next sequence (`max(sequence) + 1`) from a server read, and admins can change it.

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vocabulary` | Public | List published words with `search`, `letter`, `status`, `page`, and `pageSize` (default 20); an admin session also sees drafts |
| `POST` | `/api/vocabulary` | Admin | Create a word with its meanings, examples, optional synonym/antonym, sequence, part of speech, and status |
| `PATCH` | `/api/vocabulary/:id` | Admin | Update any vocabulary field |
| `DELETE` | `/api/vocabulary/:id` | Admin | Delete a vocabulary row |

`GET` returns `{ success: true, data: { items, pagination, nextSequence } }`. Mutation handlers validate with `vocabularyInputSchema` and return the shared `{ success, message, data }` shape; a missing record returns `404` with "Vocabulary is not found."

---

## 11. Conversation Library

`src/app/conversations/page.tsx` follows the same composition as the other libraries: `ConversationContent` awaits `connection()`, reads the `search` and `page` search params, and calls `listConversations()` directly. A conversation is a two-speaker dialogue stored as a parent row (title, the two speaker names, description, sequence) plus one child row per turn.

### Header, search, and table

- The header states **Regular conversation** — the sidebar label — with a subtitle and the admin-only **New conversation** button.
- A debounced search matches the title, the description, or either speaker name. Search, publication status, and page live in URL search params (`search`, `status`, `page`), so the list stays server-rendered.
- The table shows one **Conversation** entry per row — the row's `sequence` as a quiet `#N` line, the title, both **speaker names** on the line below it in their own colours, then a description preview capped at 60 characters with a `...` suffix — so a learner can recognise a dialogue before opening it, then a **Category** badge, a **Practice** link to `/conversations/[id]` and admin-only edit/delete actions. There is no separate Speakers column: the names belong to the entry, and the colour is what tells the two voices apart. Below `sm` the same row renders as a card carrying every one of those fields, with the description uncapped and a full-width Practice link, so a phone never scrolls sideways. The list query never loads the turns. Sequence is ordered on and shown only as that `#N` line, never as a column, and only admins see the `warning` **Draft** badge beside an unpublished title plus the `All statuses` dropdown.
- Editing needs the turns, which the list does not carry, so `ConversationSection` awaits `GET /api/conversations/:id` before opening the modal. Delete asks for SweetAlert confirmation and warns that the turns go with it; every successful mutation calls `router.refresh()`.

### Turn editor with drag and drop

`ConversationFormModal` collects the title, description, the two speaker names, and the turn list, then a **Status** dropdown (`Published` / `Draft`) and **Sequence** as the last field before the footer. The turn list is `ConversationLineSorter`, built on `@dnd-kit`:

- `DndContext` + `SortableContext` with the vertical strategy; each row is a drag handle, the speaker badge and turn label derived from its position, a textarea, and a remove action.
- `PointerSensor` only starts a drag after 6 px of movement, so clicking into a textarea to edit a turn never picks the row up, and `KeyboardSensor` with `sortableKeyboardCoordinates` keeps the accessible path: focus the handle, press space, move with the arrows, press space again.
- A drag preview is rendered through `DragOverlay` from a plain component, so `useSortable` is never called inside the overlay.
- Turns are plain text on the client and reach the API as an ordered `lines` array; the React keys never leave the browser. The **Add turn** button appends, and removing is disabled at the minimum of two turns, so the form cannot submit what the schema rejects.
- Because the speaker comes from the turn position (`sequence % 2`), reordering automatically reassigns which name each line is spoken by and the two voices keep alternating.

On save, the service writes the parent and its children inside one `prisma.$transaction`. An update replaces the whole turn list (`deleteMany` then `create` in the submitted order) because the incoming array is the entire truth about turn order.

### Practice route

`/conversations/[id]` is a blocking route (`instant = false`) so an unknown id returns a real `404`. The page renders **Back to conversations**, the server-side **Previous**/**Next** row, the title with its description — and nothing else, since the conversation's category stays in the library table — then `ConversationPracticeWorkspace`.

- The dialogue comes before anything you can press. One fixed-height **Conversation turns** card sits at the top of the page, so a long conversation scrolls inside it instead of pushing the controls away; each turn is one row — a quiet `Name · Turn N` caption with the name in its speaker's colour, then the turn text beside a 2 px left rule in that same colour. Below the card come the dropdowns and the buttons, and the IPA list appears under those. `Copy` puts the title followed by `Name: turn` lines on the clipboard.
- `ConversationIpaCard` — the **Show IPA** section, with no card of its own — shows the same turns with automatic IPA beneath each one, transcribed in the selected accent, and gives every turn its own **Listen** button.
- `ConversationPracticeControls` puts one **Accent** (for both speakers), **Speed**, the **Show IPA** switch, and a **Voice** dropdown per speaker into a control field that follows the filter-bar rule: Accent, Speed and the switch are three controls, so Accent takes the whole phone row and those two pair under it, three to a row from `sm`, while the two **Voice** dropdowns take a full-width row of their own below them — half that row each, so 165 px on a phone and 456 px on a desktop, wide enough for a long voice name. The voices are labelled `Voice (Mina)` / `Voice (Raju)` from the saved names with no badge pill above them, each list filtered to the voices of the selected accent and defaulting to `Automatic (best match)`. Below `sm`, **Reset**, **Start** and **Repeat** sit on one row as three even thirds of the width at 12 px, and Repeat shows its word beside the icon like its two neighbours. `useConversationPractice` queues one `SpeechSynthesisUtterance` per turn and starts the next from the previous `onend`, so the two voices alternate inside a single playback. Pausing holds at the turn boundary and Start resumes from that turn; Reset returns to turn 1; Repeat loops the whole conversation but never a single Listen card.
- **The speaker names are never spoken.** A name is a label in the DOM, in the control legends, and in the copied text — only the turn words reach the utterance.
- The accent and both voice choices live in React state for the session only: nothing is written to `localStorage` or to the database. Voices come from the operating system and browser; if no voice matches the selected accent, the app leaves the voice unset and shows the fallback notice, and if that accent offers only one voice the two speakers sound alike until you pick voices by hand. The Web Speech API has no gender metadata, so the female/male labels in the voice list are a name heuristic used only to pick a sensible default.

### Authorization and API

- Conversation pages remain public; authorization lives in `src/server/services/conversation.service.ts`.
- `requireAdminUser()` returns `401` when signed out and `403` for a `public` user on create, update, and delete; UI gating with `useAuth()` is a convenience, not the security boundary.
- Reads resolve the role with `canViewUnpublishedContent()`, which only reads cookies, so the Server Component may call it. A draft conversation reads as `404` for anyone who is not an admin — on the list, on `GET /api/conversations/:id`, on `/conversations/[id]`, and as a Previous/Next neighbour.
- The page does not call `resolveSessionUser()` because that can write refreshed cookies, which is not allowed in a Server Component.

### Data rules

- Title: 1–200 characters and unique. Speaker names: 1–60 each (trimmed). Description: 1–500. Each turn: 1–1000 characters, between 2 and 60 turns per conversation. Sequence: integer from 1 to 100,000. `isPublished` defaults to `true` when a payload omits it.
- Sequence is not unique; rows are ordered by `sequence` ascending, then `createdAt` ascending. A turn is ordered by its own `sequence` inside its conversation.
- Saving a title another row already owns returns `409` with "A conversation with this title already exists."; editing a row under its own title succeeds. A missing record returns `404` with "Conversation is not found."
- The form suggests the next sequence (`max(sequence) + 1`) from a server read, and admins can change it.

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations` | Public | List published conversations with `search`, `status`, `page`, and `pageSize` (default 20); an admin session also sees drafts |
| `GET` | `/api/conversations/:id` | Public | Read one published conversation with its ordered turns (drafts are admin-only) |
| `POST` | `/api/conversations` | Admin | Create a conversation, its turns, and its publication status |
| `PATCH` | `/api/conversations/:id` | Admin | Update the conversation, replace its turn list, and change its status |
| `DELETE` | `/api/conversations/:id` | Admin | Delete a conversation and, by cascade, its turns |

`GET` returns `{ success: true, data: { items, pagination, nextSequence } }`. Mutation handlers validate with `conversationInputSchema` and return the shared `{ success, message, data }` shape.

---

## 12. Practice Workspace

`src/features/practice/PracticeWorkspace.tsx` is the editable client island embedded by the Practice page. The advanced IPA and speech behavior lives in `useSpeechPractice.ts` and is rendered by `SpeechPracticeControls` and `IpaTranscriptionCard`; `src/features/presentation/PresentationPracticeWorkspace.tsx` reuses all three with saved text. The Sentence and Vocabulary libraries instead use the listen-only `useIpaTranscription`, `InlineIpa`, `useListenSpeech`, `PlayTextButton`, and `ListenControls`, where IPA appears automatically below every item and the learner chooses accent, voice and speed. The Conversation library uses a third engine of its own, `useConversationPractice`, because a dialogue needs a separate voice per speaker; it is deliberately not collapsed into either of the shared hooks. All three build their voice dropdowns through `speechVoices.ts`, so the accent filtering and the name-token gender label exist once.

- **English text** — a textarea for the text to practice; speech and IPA both follow its current value. The presentation page instead shows the saved text in a scrollable read-only panel; the Sentence and Vocabulary libraries show saved items inside expanded rows.
- **Accent dropdown** — British English (`en-GB`) or American English (`en-US`).
- **Voice dropdown** — sits immediately after the accent and lists only that accent's voices, starting with `Automatic (best match)`, then e.g. `Microsoft David Desktop · male`. Automatic resolves to the best voice for the accent; a hand-picked voice is used verbatim. Changing it stops playback and asks you to start again, and changing the accent clears the pick because a voice belonged to the accent it was listed under. The choice is React state for the session only — never `localStorage`.
- **Speed dropdown** — `0.5×` through `1.5×`, applied to the utterance's `rate`. Changing speed during playback stops speech and asks you to press Start again.
- **Show IPA translation** — computes a dialect-aware IPA transcription. The `phonemize` package is loaded on demand, so its pronunciation data is not part of the initial page bundle.
- **IPA view dropdown** — switches between *Sentence by sentence*, where each sentence is paired with its own IPA line in a separated card, and *Full translation*, a single continuous transcription block. Sentences are found with `Intl.Segmenter`, with abbreviation handling for forms such as `Mr.`, `Dr.`, and `Jan.`, so manual line breaks are not required.
- **Reset** — a `secondary` button that cancels playback and returns the row to its initial state, so the next Start speaks from the beginning. Disabled while nothing is playing or paused.
- **Start / Pause** — one button that flips with playback. While idle or paused it reads **Start** with a play icon and either starts the text in the selected accent, voice and speed or resumes a paused utterance from where it stopped; while speaking it reads **Pause** with a pause icon and pauses without rewinding.
- **Repeat** — the loop icon button after Start/Pause. It has no text of its own (the `RiLoopRightLine` icon, a **Repeat** tooltip and `aria-pressed` carry it) and toggles like a checkmark: white with a visible border while off, the dark `secondary` background while on. When on, the whole text starts again from the beginning the moment an utterance ends on its own, so a presentation plays on a loop; a single sentence card still stops after its sentence, and Reset still stops the loop.

The workspace uses a responsive card layout: controls and action buttons stack on phones, the advanced control grid becomes two columns on tablets (`sm`) and four on wide screens (`xl`), the inline `ListenControls` grid goes two-up at `sm` and three across at `lg` — or stays a single column where the panel is narrow — and nothing overflows horizontally at 390 px, 768 px, or 1440 px.

Speech playback uses `window.speechSynthesis`. Available voices come from the operating system and browser, and every listen surface lets the learner pick one by hand with the **Voice** dropdown that follows the accent. If no voice matches the selected accent, the app falls back to the browser's default English voice and displays a notice. On the Practice page only, the text is saved to `localStorage` (`spoken-english-practice:text`) as you type and restored on reload; emptying the textarea removes the saved entry. IPA and audio remain session-only, audio never leaves the browser, and nothing is written to the database.

---

## 13. Shared UI Primitives

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

`DataTable` also supports single-row expansion via optional `expandedRowId` and `renderExpandedRow` props (used by the Sentence and Vocabulary libraries). `Dropdown` portal-renders its menu into `document.body` with fixed, viewport-aware positioning so it is never clipped by table scroll containers. Modal footers keep their submit and cancel buttons at equal full width inside `flex items-center gap-3`, with Cancel as the `secondary` variant. `StatCard` powers the home totals, and its sub-`sm` sizes are tuned so a count stays readable on a phone.

---

## 14. Quality Gates

| Check | Command | Current Result |
| :--- | :--- | :--- |
| Lint | `npm run lint` | 0 errors, 1 known `react-hooks/exhaustive-deps` warning in `SearchInput` |
| Types | `npx tsc --noEmit` | Clean |
| Build | `npm run build` | Clean — `/`, `/practice`, `/admin-register`, and `/_not-found` prerender statically; `/presentation`, `/sentences`, `/vocabulary`, and `/conversations` are partial prerenders; `/presentation/[id]` and `/conversations/[id]` are blocking dynamic routes; API routes are dynamic |

Pages without request data remain fully static. The Presentation, Sentences, Vocabulary, and Conversation pages stream their database reads through `<Suspense>` and call `connection()` inside that boundary, so the shell is prerendered while the rows arrive per request. `/api/auth/profile` awaits `connection()` before reading cookies so it is always evaluated per request. The sidebar's `usePathname()` is wrapped in `<Suspense>` with a width-preserving fallback so dynamic routes can prerender their shell.
