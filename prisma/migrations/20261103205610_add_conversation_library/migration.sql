-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "speaker1" TEXT NOT NULL,
    "speaker2" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_line" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_title_key" ON "conversation"("title");

-- CreateIndex
CREATE INDEX "conversation_sequence_createdAt_idx" ON "conversation"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "conversation_line_conversationId_sequence_idx" ON "conversation_line"("conversationId", "sequence");

-- AddForeignKey
ALTER TABLE "conversation_line" ADD CONSTRAINT "conversation_line_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
