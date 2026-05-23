-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN "weatherQueryKeyName" TEXT NOT NULL DEFAULT 'access_key';
ALTER TABLE "SystemConfig" ADD COLUMN "weatherHeaderName" TEXT NOT NULL DEFAULT 'X-Proxy-Key';

-- CreateTable
CREATE TABLE "TinyPngAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "TinyPngAccount_isActive_order_idx" ON "TinyPngAccount"("isActive", "order");
