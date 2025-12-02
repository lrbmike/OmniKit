-- CreateTable
CREATE TABLE "ClipboardNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'default-admin',
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ClipboardNote_userId_createdAt_idx" ON "ClipboardNote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClipboardNote_userId_order_idx" ON "ClipboardNote"("userId", "order");
