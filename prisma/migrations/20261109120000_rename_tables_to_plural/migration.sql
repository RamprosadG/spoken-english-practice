-- Rename every table to its lowercase plural @@map and the interview library to
-- Question. Hand-written because `migrate dev` cannot detect a table rename: it
-- would emit DROP TABLE + CREATE TABLE and destroy the hand-entered library rows.
-- ALTER TABLE ... RENAME moves the data in place; no row is read or rewritten.
--
-- Constraints and indexes keep their old names across a table rename, so each one
-- is renamed here too. Without that, Prisma reports drift and the next generated
-- migration would drop and rebuild every index. Prisma emits @unique as a unique
-- index rather than a table constraint, so those rename through ALTER INDEX.

-- RenameTable: presentation -> presentations
ALTER TABLE "presentation" RENAME TO "presentations";
ALTER TABLE "presentations" RENAME CONSTRAINT "presentation_pkey" TO "presentations_pkey";
ALTER INDEX "presentation_title_key" RENAME TO "presentations_title_key";
ALTER TABLE "presentations" RENAME CONSTRAINT "presentation_categoryId_fkey" TO "presentations_categoryId_fkey";
ALTER INDEX "presentation_sequence_createdAt_idx" RENAME TO "presentations_sequence_createdAt_idx";
ALTER INDEX "presentation_categoryId_sequence_createdAt_idx" RENAME TO "presentations_categoryId_sequence_createdAt_idx";

-- RenameTable: presentation_category -> presentation_categories
ALTER TABLE "presentation_category" RENAME TO "presentation_categories";
ALTER TABLE "presentation_categories" RENAME CONSTRAINT "presentation_category_pkey" TO "presentation_categories_pkey";
ALTER INDEX "presentation_category_name_key" RENAME TO "presentation_categories_name_key";
ALTER INDEX "presentation_category_sequence_createdAt_idx" RENAME TO "presentation_categories_sequence_createdAt_idx";

-- RenameTable: sentence -> sentences
ALTER TABLE "sentence" RENAME TO "sentences";
ALTER TABLE "sentences" RENAME CONSTRAINT "sentence_pkey" TO "sentences_pkey";
ALTER INDEX "sentence_text_key" RENAME TO "sentences_text_key";
ALTER TABLE "sentences" RENAME CONSTRAINT "sentence_categoryId_fkey" TO "sentences_categoryId_fkey";
ALTER INDEX "sentence_sequence_createdAt_idx" RENAME TO "sentences_sequence_createdAt_idx";
ALTER INDEX "sentence_categoryId_sequence_createdAt_idx" RENAME TO "sentences_categoryId_sequence_createdAt_idx";

-- RenameTable: sentence_category -> sentence_categories
ALTER TABLE "sentence_category" RENAME TO "sentence_categories";
ALTER TABLE "sentence_categories" RENAME CONSTRAINT "sentence_category_pkey" TO "sentence_categories_pkey";
ALTER INDEX "sentence_category_name_key" RENAME TO "sentence_categories_name_key";
ALTER INDEX "sentence_category_sequence_createdAt_idx" RENAME TO "sentence_categories_sequence_createdAt_idx";

-- RenameTable: sentence_alternate -> sentence_alternates
ALTER TABLE "sentence_alternate" RENAME TO "sentence_alternates";
ALTER TABLE "sentence_alternates" RENAME CONSTRAINT "sentence_alternate_pkey" TO "sentence_alternates_pkey";
ALTER TABLE "sentence_alternates" RENAME CONSTRAINT "sentence_alternate_sentenceId_fkey" TO "sentence_alternates_sentenceId_fkey";
ALTER INDEX "sentence_alternate_sentenceId_sequence_idx" RENAME TO "sentence_alternates_sentenceId_sequence_idx";

-- RenameTable: conversation -> conversations
ALTER TABLE "conversation" RENAME TO "conversations";
ALTER TABLE "conversations" RENAME CONSTRAINT "conversation_pkey" TO "conversations_pkey";
ALTER INDEX "conversation_title_key" RENAME TO "conversations_title_key";
ALTER TABLE "conversations" RENAME CONSTRAINT "conversation_categoryId_fkey" TO "conversations_categoryId_fkey";
ALTER INDEX "conversation_sequence_createdAt_idx" RENAME TO "conversations_sequence_createdAt_idx";
ALTER INDEX "conversation_categoryId_sequence_createdAt_idx" RENAME TO "conversations_categoryId_sequence_createdAt_idx";

-- RenameTable: conversation_category -> conversation_categories
ALTER TABLE "conversation_category" RENAME TO "conversation_categories";
ALTER TABLE "conversation_categories" RENAME CONSTRAINT "conversation_category_pkey" TO "conversation_categories_pkey";
ALTER INDEX "conversation_category_name_key" RENAME TO "conversation_categories_name_key";
ALTER INDEX "conversation_category_sequence_createdAt_idx" RENAME TO "conversation_categories_sequence_createdAt_idx";

-- RenameTable: conversation_line -> conversation_lines
ALTER TABLE "conversation_line" RENAME TO "conversation_lines";
ALTER TABLE "conversation_lines" RENAME CONSTRAINT "conversation_line_pkey" TO "conversation_lines_pkey";
ALTER TABLE "conversation_lines" RENAME CONSTRAINT "conversation_line_conversationId_fkey" TO "conversation_lines_conversationId_fkey";
ALTER INDEX "conversation_line_conversationId_sequence_idx" RENAME TO "conversation_lines_conversationId_sequence_idx";

-- RenameTable: listening -> listenings
ALTER TABLE "listening" RENAME TO "listenings";
ALTER TABLE "listenings" RENAME CONSTRAINT "listening_pkey" TO "listenings_pkey";
ALTER INDEX "listening_title_key" RENAME TO "listenings_title_key";
ALTER TABLE "listenings" RENAME CONSTRAINT "listening_categoryId_fkey" TO "listenings_categoryId_fkey";
ALTER INDEX "listening_sequence_createdAt_idx" RENAME TO "listenings_sequence_createdAt_idx";
ALTER INDEX "listening_categoryId_sequence_createdAt_idx" RENAME TO "listenings_categoryId_sequence_createdAt_idx";

-- RenameTable: listening_category -> listening_categories
ALTER TABLE "listening_category" RENAME TO "listening_categories";
ALTER TABLE "listening_categories" RENAME CONSTRAINT "listening_category_pkey" TO "listening_categories_pkey";
ALTER INDEX "listening_category_name_key" RENAME TO "listening_categories_name_key";
ALTER INDEX "listening_category_sequence_createdAt_idx" RENAME TO "listening_categories_sequence_createdAt_idx";

-- RenameTable: listening_item -> listening_items
ALTER TABLE "listening_item" RENAME TO "listening_items";
ALTER TABLE "listening_items" RENAME CONSTRAINT "listening_item_pkey" TO "listening_items_pkey";
ALTER TABLE "listening_items" RENAME CONSTRAINT "listening_item_listeningId_fkey" TO "listening_items_listeningId_fkey";
ALTER INDEX "listening_item_listeningId_sequence_idx" RENAME TO "listening_items_listeningId_sequence_idx";

-- RenameTable: vocabulary -> vocabularies
ALTER TABLE "vocabulary" RENAME TO "vocabularies";
ALTER TABLE "vocabularies" RENAME CONSTRAINT "vocabulary_pkey" TO "vocabularies_pkey";
ALTER INDEX "vocabulary_text_key" RENAME TO "vocabularies_text_key";
ALTER TABLE "vocabularies" RENAME CONSTRAINT "vocabulary_categoryId_fkey" TO "vocabularies_categoryId_fkey";
ALTER INDEX "vocabulary_sequence_createdAt_idx" RENAME TO "vocabularies_sequence_createdAt_idx";
ALTER INDEX "vocabulary_categoryId_sequence_createdAt_idx" RENAME TO "vocabularies_categoryId_sequence_createdAt_idx";

-- RenameTable: vocabulary_category -> vocabulary_categories
ALTER TABLE "vocabulary_category" RENAME TO "vocabulary_categories";
ALTER TABLE "vocabulary_categories" RENAME CONSTRAINT "vocabulary_category_pkey" TO "vocabulary_categories_pkey";
ALTER INDEX "vocabulary_category_name_key" RENAME TO "vocabulary_categories_name_key";
ALTER INDEX "vocabulary_category_sequence_createdAt_idx" RENAME TO "vocabulary_categories_sequence_createdAt_idx";

-- RenameTable: vocabulary_synonym -> vocabulary_synonyms
ALTER TABLE "vocabulary_synonym" RENAME TO "vocabulary_synonyms";
ALTER TABLE "vocabulary_synonyms" RENAME CONSTRAINT "vocabulary_synonym_pkey" TO "vocabulary_synonyms_pkey";
ALTER TABLE "vocabulary_synonyms" RENAME CONSTRAINT "vocabulary_synonym_vocabularyId_fkey" TO "vocabulary_synonyms_vocabularyId_fkey";
ALTER INDEX "vocabulary_synonym_vocabularyId_sequence_idx" RENAME TO "vocabulary_synonyms_vocabularyId_sequence_idx";

-- RenameTable: vocabulary_antonym -> vocabulary_antonyms
ALTER TABLE "vocabulary_antonym" RENAME TO "vocabulary_antonyms";
ALTER TABLE "vocabulary_antonyms" RENAME CONSTRAINT "vocabulary_antonym_pkey" TO "vocabulary_antonyms_pkey";
ALTER TABLE "vocabulary_antonyms" RENAME CONSTRAINT "vocabulary_antonym_vocabularyId_fkey" TO "vocabulary_antonyms_vocabularyId_fkey";
ALTER INDEX "vocabulary_antonym_vocabularyId_sequence_idx" RENAME TO "vocabulary_antonyms_vocabularyId_sequence_idx";

-- RenameTable: interview_category -> question_categories
ALTER TABLE "interview_category" RENAME TO "question_categories";
ALTER TABLE "question_categories" RENAME CONSTRAINT "interview_category_pkey" TO "question_categories_pkey";
ALTER INDEX "interview_category_name_key" RENAME TO "question_categories_name_key";
ALTER INDEX "interview_category_sequence_createdAt_idx" RENAME TO "question_categories_sequence_createdAt_idx";

-- RenameTable: interview_topic -> question_topics
ALTER TABLE "interview_topic" RENAME TO "question_topics";
ALTER TABLE "question_topics" RENAME CONSTRAINT "interview_topic_pkey" TO "question_topics_pkey";
ALTER INDEX "interview_topic_name_key" RENAME TO "question_topics_name_key";
ALTER INDEX "interview_topic_sequence_createdAt_idx" RENAME TO "question_topics_sequence_createdAt_idx";

-- RenameTable: interview_question -> questions
ALTER TABLE "interview_question" RENAME TO "questions";
ALTER TABLE "questions" RENAME CONSTRAINT "interview_question_pkey" TO "questions_pkey";
ALTER INDEX "interview_question_question_key" RENAME TO "questions_question_key";
ALTER TABLE "questions" RENAME CONSTRAINT "interview_question_categoryId_fkey" TO "questions_categoryId_fkey";
ALTER TABLE "questions" RENAME CONSTRAINT "interview_question_topicId_fkey" TO "questions_topicId_fkey";
ALTER INDEX "interview_question_sequence_createdAt_idx" RENAME TO "questions_sequence_createdAt_idx";
ALTER INDEX "interview_question_categoryId_sequence_createdAt_idx" RENAME TO "questions_categoryId_sequence_createdAt_idx";
ALTER INDEX "interview_question_topicId_sequence_createdAt_idx" RENAME TO "questions_topicId_sequence_createdAt_idx";

-- RenameType: InterviewDifficulty -> QuestionDifficulty
ALTER TYPE "InterviewDifficulty" RENAME TO "QuestionDifficulty";