'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';

export async function getSystemConfig() {
    try {
        const results = await db.$queryRawUnsafe('SELECT * FROM SystemConfig LIMIT 1') as any[];
        if (results && results.length > 0) {
            const config = results[0];
            return {
                ...config,
                isInitialized: config.isInitialized === 1 || config.isInitialized === true,
                weatherEnabled: config.weatherEnabled === 1 || config.weatherEnabled === true,
            };
        }
    } catch (error) {
        console.error('Get system config raw error:', error);
    }
    return await db.systemConfig.findFirst();
}

export async function updateSystemConfig(data: { 
    defaultLocale?: string; 
    defaultTheme?: string; 
    dashboardQuickTools?: string;
    weatherEnabled?: boolean;
    weatherUrl?: string;
    weatherApiKey?: string;
    weatherKeyMode?: string;
    weatherCity?: string;
}) {
    try {
        const config = await db.systemConfig.findFirst();
        if (!config) {
            // Should not happen if initialized
            return { success: false, error: 'System config not found' };
        }

        // Split data into known fields and weather fields (which might not be in generated client yet)
        const knownData: any = {};
        const weatherData: any = {};

        if (data.defaultLocale !== undefined) knownData.defaultLocale = data.defaultLocale;
        if (data.defaultTheme !== undefined) knownData.defaultTheme = data.defaultTheme;
        if (data.dashboardQuickTools !== undefined) knownData.dashboardQuickTools = data.dashboardQuickTools;

        if (data.weatherEnabled !== undefined) weatherData.weatherEnabled = data.weatherEnabled;
        if (data.weatherUrl !== undefined) weatherData.weatherUrl = data.weatherUrl;
        if (data.weatherApiKey !== undefined) weatherData.weatherApiKey = data.weatherApiKey;
        if (data.weatherKeyMode !== undefined) weatherData.weatherKeyMode = data.weatherKeyMode;
        if (data.weatherCity !== undefined) weatherData.weatherCity = data.weatherCity;

        // Update known fields using Prisma Client
        if (Object.keys(knownData).length > 0) {
            await db.systemConfig.update({
                where: { id: config.id },
                data: knownData,
            });
        }

        // Update weather fields using Raw SQL to bypass potential client mismatch
        if (Object.keys(weatherData).length > 0) {
            const setClauses = [];
            const params = [];

            if (weatherData.weatherEnabled !== undefined) {
                setClauses.push('weatherEnabled = ?');
                params.push(weatherData.weatherEnabled ? 1 : 0);
            }
            if (weatherData.weatherUrl !== undefined) {
                setClauses.push('weatherUrl = ?');
                params.push(weatherData.weatherUrl);
            }
            if (weatherData.weatherApiKey !== undefined) {
                setClauses.push('weatherApiKey = ?');
                params.push(weatherData.weatherApiKey);
            }
            if (weatherData.weatherKeyMode !== undefined) {
                setClauses.push('weatherKeyMode = ?');
                params.push(weatherData.weatherKeyMode);
            }
            if (weatherData.weatherCity !== undefined) {
                setClauses.push('weatherCity = ?');
                params.push(weatherData.weatherCity);
            }

            if (setClauses.length > 0) {
                params.push(config.id);
                const sql = `UPDATE SystemConfig SET ${setClauses.join(', ')} WHERE id = ?`;
                await db.$executeRawUnsafe(sql, ...params);
            }
        }

        revalidatePath('/', 'layout');
        revalidatePath('/[locale]/admin/dashboard', 'page');
        return { success: true };
    } catch (error) {
        console.error('Update system config error:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}

export async function updatePassword(newPassword: string) {
    try {
        const session = await getSession();
        if (!session || !session.isLoggedIn || !session.email) {
            return { success: false, error: 'Unauthorized' };
        }

        // In a multi-user system, we would update session.user.id
        // For now, we assume single admin user "default-admin" or find by email
        const user = await db.user.findUnique({
            where: { email: session.email },
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: 'Failed to update password' };
    }
}
