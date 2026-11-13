-- Hand-written rather than generated: `migrate dev` would emit ADD COLUMN ...
-- NOT NULL over 150 hand-entered rows and fail. The safe order is add nullable,
-- backfill, deduplicate, then constrain. Nothing here drops or rewrites content.
--
-- The backfill mirrors slugify() in src/lib/slug.ts for the ASCII titles and
-- words already stored: lowercase, every run of non-alphanumerics becomes one
-- hyphen, hyphens trimmed at both ends, capped at 80 characters. A title that
-- folds to nothing (Bengali only) falls back to 'entry' so the row stays
-- reachable. Slugs are generated once on create and never rewritten afterwards,
-- so editing a title cannot break a published URL.

-- presentations -------------------------------------------------------------
ALTER TABLE "presentations" ADD COLUMN "slug" TEXT;

UPDATE "presentations"
SET "slug" = COALESCE(
  NULLIF(trim(BOTH '-' FROM left(trim(BOTH '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')), 80)), ''),
  'entry'
);

WITH ranked AS (
  SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt", "id") AS rn
  FROM "presentations"
)
UPDATE "presentations" AS p
SET "slug" = ranked."slug" || '-' || ranked.rn
FROM ranked
WHERE p."id" = ranked."id" AND ranked.rn > 1;

CREATE UNIQUE INDEX "presentations_slug_key" ON "presentations"("slug");
ALTER TABLE "presentations" ALTER COLUMN "slug" SET NOT NULL;

-- sentences -----------------------------------------------------------------
ALTER TABLE "sentences" ADD COLUMN "slug" TEXT;

UPDATE "sentences"
SET "slug" = COALESCE(
  NULLIF(trim(BOTH '-' FROM left(trim(BOTH '-' FROM regexp_replace(lower("text"), '[^a-z0-9]+', '-', 'g')), 80)), ''),
  'entry'
);

WITH ranked AS (
  SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt", "id") AS rn
  FROM "sentences"
)
UPDATE "sentences" AS p
SET "slug" = ranked."slug" || '-' || ranked.rn
FROM ranked
WHERE p."id" = ranked."id" AND ranked.rn > 1;

CREATE UNIQUE INDEX "sentences_slug_key" ON "sentences"("slug");
ALTER TABLE "sentences" ALTER COLUMN "slug" SET NOT NULL;

-- vocabularies --------------------------------------------------------------
ALTER TABLE "vocabularies" ADD COLUMN "slug" TEXT;

UPDATE "vocabularies"
SET "slug" = COALESCE(
  NULLIF(trim(BOTH '-' FROM left(trim(BOTH '-' FROM regexp_replace(lower("text"), '[^a-z0-9]+', '-', 'g')), 80)), ''),
  'entry'
);

WITH ranked AS (
  SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt", "id") AS rn
  FROM "vocabularies"
)
UPDATE "vocabularies" AS p
SET "slug" = ranked."slug" || '-' || ranked.rn
FROM ranked
WHERE p."id" = ranked."id" AND ranked.rn > 1;

CREATE UNIQUE INDEX "vocabularies_slug_key" ON "vocabularies"("slug");
ALTER TABLE "vocabularies" ALTER COLUMN "slug" SET NOT NULL;

-- conversations -------------------------------------------------------------
ALTER TABLE "conversations" ADD COLUMN "slug" TEXT;

UPDATE "conversations"
SET "slug" = COALESCE(
  NULLIF(trim(BOTH '-' FROM left(trim(BOTH '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')), 80)), ''),
  'entry'
);

WITH ranked AS (
  SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt", "id") AS rn
  FROM "conversations"
)
UPDATE "conversations" AS p
SET "slug" = ranked."slug" || '-' || ranked.rn
FROM ranked
WHERE p."id" = ranked."id" AND ranked.rn > 1;

CREATE UNIQUE INDEX "conversations_slug_key" ON "conversations"("slug");
ALTER TABLE "conversations" ALTER COLUMN "slug" SET NOT NULL;

-- listenings ----------------------------------------------------------------
ALTER TABLE "listenings" ADD COLUMN "slug" TEXT;

UPDATE "listenings"
SET "slug" = COALESCE(
  NULLIF(trim(BOTH '-' FROM left(trim(BOTH '-' FROM regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')), 80)), ''),
  'entry'
);

WITH ranked AS (
  SELECT "id", "slug", ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt", "id") AS rn
  FROM "listenings"
)
UPDATE "listenings" AS p
SET "slug" = ranked."slug" || '-' || ranked.rn
FROM ranked
WHERE p."id" = ranked."id" AND ranked.rn > 1;

CREATE UNIQUE INDEX "listenings_slug_key" ON "listenings"("slug");
ALTER TABLE "listenings" ALTER COLUMN "slug" SET NOT NULL;