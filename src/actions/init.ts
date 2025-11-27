'use server';

import { db } from '@/lib/db';
import { markSystemInitialized, updateSystemConfig } from '@/lib/init';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Validation schemas
const adminAccountSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

const dbConfigSchema = z.object({
    dbType: z.enum(['sqlite', 'mysql', 'postgresql']),
    dbHost: z.string().optional(),
    dbPort: z.number().optional(),
    dbName: z.string().optional(),
    dbUser: z.string().optional(),
    dbPassword: z.string().optional(),
});

/**
 * Complete initialization wizard
 */
export async function completeInitialization(formData: FormData) {
    try {
        // Parse form data
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const locale = formData.get('locale') as string || 'zh';
        const dbType = formData.get('dbType') as string || 'sqlite';

        // Validate admin account
        const accountValidation = adminAccountSchema.safeParse({
            email,
            password,
            confirmPassword,
        });

        if (!accountValidation.success) {
            return {
                success: false,
                error: accountValidation.error.issues[0].message,
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'admin',
            },
        });

        // Update system config
        await updateSystemConfig({
            defaultLocale: locale,
            dbType,
        });

        // Mark system as initialized
        await markSystemInitialized();

        // Create session
        const session = await getSession();
        session.userId = user.id;
        session.email = user.email;
        session.isLoggedIn = true;
        await session.save();

        return { success: true };
    } catch (error) {
        console.error('Initialization error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Initialization failed',
        };
    }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(formData: FormData) {
    console.log('testDatabaseConnection called'); // Debug log

    const dbType = formData.get('dbType') as string;
    const dbHost = formData.get('dbHost') as string;
    const dbPort = formData.get('dbPort') as string;
    const dbName = formData.get('dbName') as string;
    const dbUser = formData.get('dbUser') as string;
    const dbPassword = formData.get('dbPassword') as string;

    console.log('DB Type:', dbType); // Debug log
    console.log('DB Host:', dbHost); // Debug log

    // For SQLite, no connection test needed
    if (dbType === 'sqlite') {
        return { success: true, message: 'SQLite is ready to use' };
    }

    // For MySQL/PostgreSQL, validate inputs
    try {
        if (!dbHost || !dbName || !dbUser) {
            return {
                success: false,
                error: 'Please provide all required database connection details (host, database name, username)',
            };
        }

        // TODO: Implement actual connection testing with mysql2 or pg
        // For now, just validate the inputs and return success
        console.log('Connection test would be performed here'); // Debug log

        return {
            success: true,
            message: `Connection parameters validated for ${dbType}. Actual connection test will be implemented.`,
        };
    } catch (error) {
        console.error('Connection test error:', error); // Debug log
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Connection test failed',
        };
    }
}
