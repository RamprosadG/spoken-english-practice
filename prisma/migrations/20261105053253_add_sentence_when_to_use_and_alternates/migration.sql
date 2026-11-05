-- AlterTable
ALTER TABLE "sentence" ADD COLUMN     "whenToUse" TEXT;

-- CreateTable
CREATE TABLE "sentence_alternate" (
    "id" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentence_alternate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sentence_alternate_sentenceId_sequence_idx" ON "sentence_alternate"("sentenceId", "sequence");

-- AddForeignKey
ALTER TABLE "sentence_alternate" ADD CONSTRAINT "sentence_alternate_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
