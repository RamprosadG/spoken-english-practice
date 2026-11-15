-- CreateTable
CREATE TABLE "video_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_categories_name_key" ON "video_categories"("name");

-- CreateIndex
CREATE INDEX "video_categories_sequence_createdAt_idx" ON "video_categories"("sequence", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "videos_title_key" ON "videos"("title");

-- CreateIndex
CREATE UNIQUE INDEX "videos_slug_key" ON "videos"("slug");

-- CreateIndex
CREATE INDEX "videos_sequence_createdAt_idx" ON "videos"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "videos_categoryId_sequence_createdAt_idx" ON "videos"("categoryId", "sequence", "createdAt");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "video_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SeedRow: every video must belong to a category, so the picker is never empty
INSERT INTO "video_categories" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'General', 1, now(), now());