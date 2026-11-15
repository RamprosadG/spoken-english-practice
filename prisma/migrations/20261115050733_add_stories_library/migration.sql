-- CreateTable
CREATE TABLE "story_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "story_categories_name_key" ON "story_categories"("name");

-- CreateIndex
CREATE INDEX "story_categories_sequence_createdAt_idx" ON "story_categories"("sequence", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "stories_title_key" ON "stories"("title");

-- CreateIndex
CREATE UNIQUE INDEX "stories_slug_key" ON "stories"("slug");

-- CreateIndex
CREATE INDEX "stories_sequence_createdAt_idx" ON "stories"("sequence", "createdAt");

-- CreateIndex
CREATE INDEX "stories_categoryId_sequence_createdAt_idx" ON "stories"("categoryId", "sequence", "createdAt");

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "story_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SeedRow: every story must belong to a category, so the picker is never empty
INSERT INTO "story_categories" ("id", "name", "sequence", "createdAt", "updatedAt")
VALUES ('99999999-9999-4999-8999-999999999999', 'General', 1, now(), now());
