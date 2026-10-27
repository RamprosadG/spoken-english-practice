-- CreateTable
CREATE TABLE "presentation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "presentation_sequence_idx" ON "presentation"("sequence");
