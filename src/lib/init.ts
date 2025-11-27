import { db } from './db';

/**
 * Check if the system has been initialized
 */
export async function isSystemInitialized(): Promise<boolean> {
    try {
        const config = await db.systemConfig.findFirst();
        return config?.isInitialized ?? false;
    } catch (error) {
        console.error('Error checking system initialization:', error);
        return false;
    }
}

/**
 * Mark system as initialized
 */
export async function markSystemInitialized(): Promise<void> {
    const config = await db.systemConfig.findFirst();

    if (config) {
        await db.systemConfig.update({
            where: { id: config.id },
            data: { isInitialized: true },
        });
    } else {
        await db.systemConfig.create({
            data: { isInitialized: true },
        });
    }
}

/**
 * Get system configuration
 */
export async function getSystemConfig() {
    return await db.systemConfig.findFirst();
}

/**
 * Update system configuration
 */
export async function updateSystemConfig(data: {
    defaultLocale?: string;
    dbType?: string;
    dbHost?: string | null;
    dbPort?: number | null;
    dbName?: string | null;
    dbUser?: string | null;
    dbPassword?: string | null;
    sessionTimeout?: number;
}) {
    const config = await db.systemConfig.findFirst();

    if (!config) {
        // If config doesn't exist, create it
        return await db.systemConfig.create({
            data: {
                ...data,
                isInitialized: false, // Default to false until explicitly marked
            },
        });
    }

    return await db.systemConfig.update({
        where: { id: config.id },
        data,
    });
}
