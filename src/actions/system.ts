'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';

export async function getSystemConfig() {
    return await db.systemConfig.findFirst();
}

export async function updateSystemConfig(data: { defaultLocale?: string; defaultTheme?: string }) {
    try {
        const config = await db.systemConfig.findFirst();
        if (!config) {
            // Should not happen if initialized
            return { success: false, error: 'System config not found' };
        }

        await db.systemConfig.update({
            where: { id: config.id },
            data,
        });

        revalidatePath('/', 'layout');
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
