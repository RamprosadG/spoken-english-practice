-- Unique library entries and composite list-order indexes.
-- Created before the indexes they replace so the list queries are never unindexed.

-- CreateIndex
CREATE UNIQUE INDEX "presentation_title_key" ON "presentation"("title");

-- CreateIndex
CREATE UNIQUE INDEX "sentence_text_key" ON "sentence"("text");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_text_key" ON "vocabulary"("text");

-- CreateIndex
CREATE INDEX "presentation_sequence_createdAt_idx" ON "presentation"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "sentence_sequence_createdAt_idx" ON "sentence"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "vocabulary_sequence_createdAt_idx" ON "vocabulary"("sequence", "createdAt");

-- DropIndex: covered by the composite indexes above
DROP INDEX "presentation_sequence_idx";

-- DropIndex
DROP INDEX "sentence_sequence_idx";

-- DropIndex
DROP INDEX "vocabulary_sequence_idx";

-- DropIndex: redundant, "users_email_key" from User.email @unique already indexes this column
DROP INDEX "users_email_idx";
