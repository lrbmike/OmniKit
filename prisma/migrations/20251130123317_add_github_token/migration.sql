-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isInitialized" BOOLEAN NOT NULL DEFAULT false,
    "defaultLocale" TEXT NOT NULL DEFAULT 'zh',
    "defaultTheme" TEXT NOT NULL DEFAULT 'system',
    "dbType" TEXT NOT NULL DEFAULT 'sqlite',
    "dbHost" TEXT,
    "dbPort" INTEGER,
    "dbName" TEXT,
    "dbUser" TEXT,
    "dbPassword" TEXT,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 604800,
    "dashboardQuickTools" TEXT,
    "weatherEnabled" BOOLEAN NOT NULL DEFAULT false,
    "weatherUrl" TEXT NOT NULL DEFAULT 'http://api.weatherstack.com/current',
    "weatherApiKey" TEXT,
    "weatherKeyMode" TEXT NOT NULL DEFAULT 'query',
    "weatherCity" TEXT NOT NULL DEFAULT '北京',
    "translatorProviderId" TEXT,
    "translatorSystemPrompt" TEXT NOT NULL DEFAULT 'You are a professional translator. Translate the following text from {sourceLang} to {targetLang}.

Text to translate:
{context}

Output only the translated text.',
    "varNameGenProviderId" TEXT,
    "varNameGenSystemPrompt" TEXT NOT NULL DEFAULT 'You are an experienced developer. Generate English variable names based on user input.

User input: {context}

Generate variable names in different formats:
- URL: web URL format (lowercase, hyphen-separated)
- Variable: camelCase variable name
- File: file name format (lowercase, hyphen-separated)
- Route: route path format (lowercase, slash-separated)

Provide both normal length and shortened versions.

Output in JSON format:
{
  "normal": {
    "url": "enterprise-certification",
    "var_name": "enterpriseCertification",
    "file_name": "enterprise-certification",
    "route": "/enterprise/certification"
  },
  "short": {
    "url": "ent-cert",
    "var_name": "entCert",
    "file_name": "ent-cert",
    "route": "/ent/cert"
  }
}',
    "githubToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AiProvider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'openai',
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT,
    "model" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "description" TEXT,
    "descriptionEn" TEXT,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "isPreset" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'default-admin',
    "parentId" TEXT,
    "toolId" TEXT,
    "label" TEXT,
    "labelEn" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isFolder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuItem_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AiProvider_isActive_order_idx" ON "AiProvider"("isActive", "order");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Tool_category_order_idx" ON "Tool"("category", "order");

-- CreateIndex
CREATE INDEX "MenuItem_userId_parentId_order_idx" ON "MenuItem"("userId", "parentId", "order");
