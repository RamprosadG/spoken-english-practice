-- Everything here is additive until the final statement: the three new tables are
-- created, one "General" vocabulary category is seeded, every existing vocabulary
-- row is backfilled onto it, each saved synonym and antonym is copied into its own
-- child row, and only then are the eight flat columns they replaced dropped. No
-- library row is deleted and no entered text is lost.

-- CreateTable
CREATE TABLE "vocabulary_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_synonym" (
    "id" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_synonym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_antonym" (
    "id" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_antonym_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_category_name_key" ON "vocabulary_category"("name");

-- CreateIndex
CREATE INDEX "vocabulary_category_sequence_createdAt_idx" ON "vocabulary_category"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "vocabulary_synonym_vocabularyId_sequence_idx" ON "vocabulary_synonym"("vocabularyId", "sequence");

-- CreateIndex
CREATE INDEX "vocabulary_antonym_vocabularyId_sequence_idx" ON "vocabulary_antonym"("vocabularyId", "sequence");

-- SeedRow: the category every existing vocabulary row is backfilled onto
INSERT INTO "vocabulary_category" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('55555555-5555-4555-8555-555555555555', 'General', 1, now(), now());

-- AlterTable: add as nullable first so the backfill can run
ALTER TABLE "vocabulary" ADD COLUMN "categoryId" TEXT;

-- Backfill: every existing word keeps its content and moves under "General"
UPDATE "vocabulary" SET "categoryId" = '55555555-5555-4555-8555-555555555555' WHERE "categoryId" IS NULL;

-- Backfill: one child row per word that already has a synonym or antonym. A flat
-- synonym sentence is stored as-is; without one the child row keeps the word alone.
INSERT INTO "vocabulary_synonym" ("id", "vocabularyId", "word", "sentence", "sequence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", "synonymText", COALESCE("synonymSentence", ''), 1, now(), now()
FROM "vocabulary"
WHERE "synonymText" IS NOT NULL AND "synonymText" <> '';

INSERT INTO "vocabulary_antonym" ("id", "vocabularyId", "word", "sentence", "sequence", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id", "antonymText", COALESCE("antonymSentence", ''), 1, now(), now()
FROM "vocabulary"
WHERE "antonymText" IS NOT NULL AND "antonymText" <> '';

-- AlterTable: now that no row is null, make the column required
ALTER TABLE "vocabulary" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex: serves a category-filtered list without a separate sort
CREATE INDEX "vocabulary_categoryId_sequence_createdAt_idx" ON "vocabulary"("categoryId", "sequence", "createdAt");

-- AddForeignKey: RESTRICT is the database half of the "block the delete" rule
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "vocabulary_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: the synonym and antonym rows belong to one word
ALTER TABLE "vocabulary_synonym" ADD CONSTRAINT "vocabulary_synonym_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vocabulary_antonym" ADD CONSTRAINT "vocabulary_antonym_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropColumns: the two child tables above now hold this text
ALTER TABLE "vocabulary" DROP COLUMN "synonymText", DROP COLUMN "synonymMeaning", DROP COLUMN "synonymSentence", DROP COLUMN "synonymSentenceMeaning", DROP COLUMN "antonymText", DROP COLUMN "antonymMeaning", DROP COLUMN "antonymSentence", DROP COLUMN "antonymSentenceMeaning";
