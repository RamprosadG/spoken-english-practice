-- This migration is purely additive: it creates the category tables, seeds one
-- "General" category per library, backfills every existing row onto it, and
-- only then makes the column required. No library row is rewritten or dropped.

-- CreateTable
CREATE TABLE "presentation_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentation_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentence_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentence_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "presentation_category_name_key" ON "presentation_category"("name");

-- CreateIndex
CREATE INDEX "presentation_category_sequence_createdAt_idx" ON "presentation_category"("sequence", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sentence_category_name_key" ON "sentence_category"("name");

-- CreateIndex
CREATE INDEX "sentence_category_sequence_createdAt_idx" ON "sentence_category"("sequence", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_category_name_key" ON "conversation_category"("name");

-- CreateIndex
CREATE INDEX "conversation_category_sequence_createdAt_idx" ON "conversation_category"("sequence", "createdAt");

-- SeedRow: the category every existing library row is backfilled onto
INSERT INTO "presentation_category" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('11111111-1111-4111-8111-111111111111', 'General', 1, now(), now());

INSERT INTO "sentence_category" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('22222222-2222-4222-8222-222222222222', 'General', 1, now(), now());

INSERT INTO "conversation_category" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('33333333-3333-4333-8333-333333333333', 'General', 1, now(), now());

-- AlterTable: add as nullable first so the backfill can run
ALTER TABLE "presentation" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "sentence" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "conversation" ADD COLUMN "categoryId" TEXT;

-- Backfill: every existing row keeps its content and moves under "General"
UPDATE "presentation" SET "categoryId" = '11111111-1111-4111-8111-111111111111' WHERE "categoryId" IS NULL;
UPDATE "sentence" SET "categoryId" = '22222222-2222-4222-8222-222222222222' WHERE "categoryId" IS NULL;
UPDATE "conversation" SET "categoryId" = '33333333-3333-4333-8333-333333333333' WHERE "categoryId" IS NULL;

-- AlterTable: now that no row is null, make the column required
ALTER TABLE "presentation" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "sentence" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "conversation" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex: serves a category-filtered list without a separate sort
CREATE INDEX "presentation_categoryId_sequence_createdAt_idx" ON "presentation"("categoryId", "sequence", "createdAt");
CREATE INDEX "sentence_categoryId_sequence_createdAt_idx" ON "sentence"("categoryId", "sequence", "createdAt");
CREATE INDEX "conversation_categoryId_sequence_createdAt_idx" ON "conversation"("categoryId", "sequence", "createdAt");

-- AddForeignKey: RESTRICT is the database half of the "block the delete" rule
ALTER TABLE "presentation" ADD CONSTRAINT "presentation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "presentation_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sentence" ADD CONSTRAINT "sentence_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "sentence_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "conversation_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
