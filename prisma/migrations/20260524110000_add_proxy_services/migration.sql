-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN "proxyGatewayApiKeyHash" TEXT;
ALTER TABLE "SystemConfig" ADD COLUMN "proxyGatewayApiKeyHint" TEXT;

-- CreateTable
CREATE TABLE "ProxyService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "timeoutMs" INTEGER NOT NULL DEFAULT 15000,
    "retryCount" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProxyUpstreamKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proxyServiceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "cooldownUntil" DATETIME,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProxyUpstreamKey_proxyServiceId_fkey" FOREIGN KEY ("proxyServiceId") REFERENCES "ProxyService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProxyService_code_key" ON "ProxyService"("code");

-- CreateIndex
CREATE INDEX "ProxyUpstreamKey_proxyServiceId_isActive_order_idx" ON "ProxyUpstreamKey"("proxyServiceId", "isActive", "order");

-- CreateIndex
CREATE INDEX "ProxyUpstreamKey_proxyServiceId_cooldownUntil_idx" ON "ProxyUpstreamKey"("proxyServiceId", "cooldownUntil");
