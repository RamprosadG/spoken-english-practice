-- CreateEnum
CREATE TYPE "InterviewDifficulty" AS ENUM ('beginner', 'intermediate', 'hard');

-- CreateTable
CREATE TABLE "interview_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "difficulty" "InterviewDifficulty" NOT NULL DEFAULT 'beginner',
    "sequence" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_category_name_key" ON "interview_category"("name");

-- CreateIndex
CREATE INDEX "interview_category_sequence_createdAt_idx" ON "interview_category"("sequence", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "interview_topic_name_key" ON "interview_topic"("name");

-- CreateIndex
CREATE INDEX "interview_topic_sequence_createdAt_idx" ON "interview_topic"("sequence", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "interview_question_question_key" ON "interview_question"("question");

-- CreateIndex
CREATE INDEX "interview_question_sequence_createdAt_idx" ON "interview_question"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "interview_question_categoryId_sequence_createdAt_idx" ON "interview_question"("categoryId", "sequence", "createdAt");

-- CreateIndex
CREATE INDEX "interview_question_topicId_sequence_createdAt_idx" ON "interview_question"("topicId", "sequence", "createdAt");

-- AddForeignKey
ALTER TABLE "interview_question" ADD CONSTRAINT "interview_question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "interview_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_question" ADD CONSTRAINT "interview_question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "interview_topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SeedRow: both links are required, so a new question can be saved before the admin makes any picker entries
INSERT INTO "interview_category" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('77777777-7777-7777-8777-777777777777', 'General', 1, now(), now());

INSERT INTO "interview_topic" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('88888888-8888-8888-8888-888888888888', 'General', 1, now(), now());
