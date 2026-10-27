-- CreateTable
CREATE TABLE "vocabulary" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "sentenceMeaning" TEXT NOT NULL,
    "synonymText" TEXT,
    "synonymMeaning" TEXT,
    "synonymSentence" TEXT,
    "synonymSentenceMeaning" TEXT,
    "antonymText" TEXT,
    "antonymMeaning" TEXT,
    "antonymSentence" TEXT,
    "antonymSentenceMeaning" TEXT,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vocabulary_sequence_idx" ON "vocabulary"("sequence");
