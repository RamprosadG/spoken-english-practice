-- CreateTable
CREATE TABLE "sentence" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sentence_sequence_idx" ON "sentence"("sequence");
