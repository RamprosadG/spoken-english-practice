-- CreateTable
CREATE TABLE "listening_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listening_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listening" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listening_item" (
    "id" TEXT NOT NULL,
    "listeningId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listening_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listening_category_name_key" ON "listening_category"("name");

-- CreateIndex
CREATE INDEX "listening_category_sequence_createdAt_idx" ON "listening_category"("sequence", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "listening_title_key" ON "listening"("title");

-- CreateIndex
CREATE INDEX "listening_sequence_createdAt_idx" ON "listening"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "listening_categoryId_sequence_createdAt_idx" ON "listening"("categoryId", "sequence", "createdAt");

-- CreateIndex
CREATE INDEX "listening_item_listeningId_sequence_idx" ON "listening_item"("listeningId", "sequence");

-- AddForeignKey
ALTER TABLE "listening" ADD CONSTRAINT "listening_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "listening_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_item" ADD CONSTRAINT "listening_item_listeningId_fkey" FOREIGN KEY ("listeningId") REFERENCES "listening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SeedRow: every listening must belong to a category, so the picker is never empty
INSERT INTO "listening_category" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('44444444-4444-4444-8444-444444444444', 'General', 1, now(), now());
