-- CreateTable
CREATE TABLE "CloudinaryAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cloudName" TEXT NOT NULL,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemConfig" (
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
INSERT INTO "new_SystemConfig" ("createdAt", "dashboardQuickTools", "dbHost", "dbName", "dbPassword", "dbPort", "dbType", "dbUser", "defaultLocale", "defaultTheme", "githubToken", "id", "isInitialized", "sessionTimeout", "translatorProviderId", "translatorSystemPrompt", "updatedAt", "varNameGenProviderId", "varNameGenSystemPrompt", "weatherApiKey", "weatherCity", "weatherEnabled", "weatherKeyMode", "weatherUrl") SELECT "createdAt", "dashboardQuickTools", "dbHost", "dbName", "dbPassword", "dbPort", "dbType", "dbUser", "defaultLocale", "defaultTheme", "githubToken", "id", "isInitialized", "sessionTimeout", "translatorProviderId", "translatorSystemPrompt", "updatedAt", "varNameGenProviderId", "varNameGenSystemPrompt", "weatherApiKey", "weatherCity", "weatherEnabled", "weatherKeyMode", "weatherUrl" FROM "SystemConfig";
DROP TABLE "SystemConfig";
ALTER TABLE "new_SystemConfig" RENAME TO "SystemConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CloudinaryAccount_isActive_order_idx" ON "CloudinaryAccount"("isActive", "order");
