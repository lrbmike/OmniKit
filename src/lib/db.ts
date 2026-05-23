import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const LEGACY_LOCAL_SQLITE_URL = 'file:./data/omnikit.db';
const LOCAL_SQLITE_URL = 'file:../data/omnikit.db';

function normalizeDatabaseUrl(databaseUrl: string | undefined) {
    if (databaseUrl === LEGACY_LOCAL_SQLITE_URL) {
        return LOCAL_SQLITE_URL;
    }

    return databaseUrl;
}

function ensureSqliteDirectory(databaseUrl: string | undefined) {
    if (!databaseUrl?.startsWith('file:')) {
        return;
    }

    if (databaseUrl === LOCAL_SQLITE_URL || databaseUrl === LEGACY_LOCAL_SQLITE_URL) {
        mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
        return;
    }

    const sqlitePath = databaseUrl.slice('file:'.length);

    if (path.isAbsolute(sqlitePath)) {
        mkdirSync(path.dirname(sqlitePath), { recursive: true });
    }
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);
ensureSqliteDirectory(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
