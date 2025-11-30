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
    aiProvider?: string;
    aiBaseUrl?: string;
    aiApiKey?: string;
    aiModel?: string;
    aiSystemPrompt?: string;
    translatorProviderId?: string;
    translatorSystemPrompt?: string;
    varNameGenProviderId?: string;
    varNameGenSystemPrompt?: string;
    githubToken?: string;
}) {
    try {
        const config = await db.systemConfig.findFirst();
        if (!config) {
            // Should not happen if initialized
            return { success: false, error: 'System config not found' };
        }

        // Split data into known fields and raw fields (weather/ai which might not be in generated client yet)
        const knownData: any = {};
        const rawData: any = {};

        if (data.defaultLocale !== undefined) knownData.defaultLocale = data.defaultLocale;
        if (data.defaultTheme !== undefined) knownData.defaultTheme = data.defaultTheme;
        if (data.dashboardQuickTools !== undefined) knownData.dashboardQuickTools = data.dashboardQuickTools;

        if (data.weatherEnabled !== undefined) rawData.weatherEnabled = data.weatherEnabled;
        if (data.weatherUrl !== undefined) rawData.weatherUrl = data.weatherUrl;
        if (data.weatherApiKey !== undefined) rawData.weatherApiKey = data.weatherApiKey;
        if (data.weatherKeyMode !== undefined) rawData.weatherKeyMode = data.weatherKeyMode;
        if (data.weatherCity !== undefined) rawData.weatherCity = data.weatherCity;

        if (data.aiProvider !== undefined) rawData.aiProvider = data.aiProvider;
        if (data.aiBaseUrl !== undefined) rawData.aiBaseUrl = data.aiBaseUrl;
        if (data.aiApiKey !== undefined) rawData.aiApiKey = data.aiApiKey;
        if (data.aiModel !== undefined) rawData.aiModel = data.aiModel;
        if (data.aiSystemPrompt !== undefined) rawData.aiSystemPrompt = data.aiSystemPrompt;

        if (data.translatorProviderId !== undefined) rawData.translatorProviderId = data.translatorProviderId;
        if (data.translatorSystemPrompt !== undefined) rawData.translatorSystemPrompt = data.translatorSystemPrompt;

        if (data.varNameGenProviderId !== undefined) rawData.varNameGenProviderId = data.varNameGenProviderId;
        if (data.varNameGenSystemPrompt !== undefined) rawData.varNameGenSystemPrompt = data.varNameGenSystemPrompt;

        if (data.githubToken !== undefined) rawData.githubToken = data.githubToken;

        // Update known fields using Prisma Client
        if (Object.keys(knownData).length > 0) {
            await db.systemConfig.update({
                where: { id: config.id },
                data: knownData,
            });
        }

        // Update raw fields using Raw SQL to bypass potential client mismatch
        if (Object.keys(rawData).length > 0) {
            const setClauses = [];
            const params = [];

            if (rawData.weatherEnabled !== undefined) {
                setClauses.push('weatherEnabled = ?');
                params.push(rawData.weatherEnabled ? 1 : 0);
            }
            if (rawData.weatherUrl !== undefined) {
                setClauses.push('weatherUrl = ?');
                params.push(rawData.weatherUrl);
            }
            if (rawData.weatherApiKey !== undefined) {
                setClauses.push('weatherApiKey = ?');
                params.push(rawData.weatherApiKey);
            }
            if (rawData.weatherKeyMode !== undefined) {
                setClauses.push('weatherKeyMode = ?');
                params.push(rawData.weatherKeyMode);
            }
            if (rawData.weatherCity !== undefined) {
                setClauses.push('weatherCity = ?');
                params.push(rawData.weatherCity);
            }

            if (rawData.aiProvider !== undefined) {
                setClauses.push('aiProvider = ?');
                params.push(rawData.aiProvider);
            }
            if (rawData.aiBaseUrl !== undefined) {
                setClauses.push('aiBaseUrl = ?');
                params.push(rawData.aiBaseUrl);
            }
            if (rawData.aiApiKey !== undefined) {
                setClauses.push('aiApiKey = ?');
                params.push(rawData.aiApiKey);
            }
            if (rawData.aiModel !== undefined) {
                setClauses.push('aiModel = ?');
                params.push(rawData.aiModel);
            }
            if (rawData.aiSystemPrompt !== undefined) {
                setClauses.push('aiSystemPrompt = ?');
                params.push(rawData.aiSystemPrompt);
            }

            if (rawData.translatorProviderId !== undefined) {
                setClauses.push('translatorProviderId = ?');
                params.push(rawData.translatorProviderId);
            }
            if (rawData.translatorSystemPrompt !== undefined) {
                setClauses.push('translatorSystemPrompt = ?');
                params.push(rawData.translatorSystemPrompt);
            }

            if (rawData.varNameGenProviderId !== undefined) {
                setClauses.push('varNameGenProviderId = ?');
                params.push(rawData.varNameGenProviderId);
            }
            if (rawData.varNameGenSystemPrompt !== undefined) {
                setClauses.push('varNameGenSystemPrompt = ?');
                params.push(rawData.varNameGenSystemPrompt);
            }

            if (rawData.githubToken !== undefined) {
                setClauses.push('githubToken = ?');
                params.push(rawData.githubToken);
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

export async function exportConfiguration() {
    try {
        const session = await getSession();
        if (!session || !session.isLoggedIn) {
            return { success: false, error: 'Unauthorized' };
        }

        // 获取系统配置
        const systemConfig = await getSystemConfig();
        
        // 获取 AI 提供商配置
        const aiProviders = await db.aiProvider.findMany({
            select: {
                id: true,
                name: true,
                baseUrl: true,
                apiKey: true,
                model: true,
                isActive: true,
            }
        });

        // 获取菜单配置
        const menuItems = await db.menuItem.findMany({
            where: { userId: 'default-admin' },
            select: {
                id: true,
                label: true,
                icon: true,
                toolId: true,
                parentId: true,
                order: true,
                isFolder: true,
            },
            orderBy: { order: 'asc' }
        });

        const config = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            systemConfig: {
                defaultLocale: systemConfig?.defaultLocale,
                defaultTheme: systemConfig?.defaultTheme,
                dashboardQuickTools: systemConfig?.dashboardQuickTools,
                weatherEnabled: systemConfig?.weatherEnabled,
                weatherUrl: systemConfig?.weatherUrl,
                weatherApiKey: systemConfig?.weatherApiKey,
                weatherKeyMode: systemConfig?.weatherKeyMode,
                weatherCity: systemConfig?.weatherCity,
                translatorProviderId: systemConfig?.translatorProviderId,
                translatorSystemPrompt: systemConfig?.translatorSystemPrompt,
                varNameGenProviderId: systemConfig?.varNameGenProviderId,
                varNameGenSystemPrompt: systemConfig?.varNameGenSystemPrompt,
            },
            aiProviders,
            menuItems,
        };

        return { 
            success: true, 
            data: JSON.stringify(config, null, 2) 
        };
    } catch (error) {
        console.error('Export configuration error:', error);
        return { success: false, error: 'Failed to export configuration' };
    }
}

export async function importConfiguration(configJson: string) {
    try {
        const session = await getSession();
        if (!session || !session.isLoggedIn) {
            return { success: false, error: 'Unauthorized' };
        }

        const config = JSON.parse(configJson);

        // 验证配置格式
        if (!config.version || !config.systemConfig) {
            return { success: false, error: 'Invalid configuration format' };
        }

        // 导入系统配置
        if (config.systemConfig) {
            await updateSystemConfig(config.systemConfig);
        }

        // 导入 AI 提供商配置
        if (config.aiProviders && Array.isArray(config.aiProviders)) {
            // 先删除现有的提供商
            await db.aiProvider.deleteMany({});
            
            // 导入新的提供商
            for (const provider of config.aiProviders) {
                await db.aiProvider.create({
                    data: {
                        name: provider.name,
                        baseUrl: provider.baseUrl,
                        apiKey: provider.apiKey,
                        model: provider.model,
                        isActive: provider.isActive ?? true,
                    }
                });
            }
        }

        // 导入菜单配置
        if (config.menuItems && Array.isArray(config.menuItems)) {
            // 先删除现有的菜单
            await db.menuItem.deleteMany({
                where: { userId: 'default-admin' }
            });

            // 创建 ID 映射表（旧 ID -> 新 ID）
            const idMap = new Map<string, string>();

            // 先创建所有根级菜单项（没有 parentId 的）
            const rootItems = config.menuItems.filter((item: any) => !item.parentId);
            for (const item of rootItems) {
                const newItem = await db.menuItem.create({
                    data: {
                        userId: 'default-admin',
                        label: item.label,
                        icon: item.icon,
                        toolId: item.toolId,
                        parentId: null,
                        order: item.order,
                        isFolder: item.isFolder ?? false,
                    }
                });
                idMap.set(item.id, newItem.id);
            }

            // 再创建有 parentId 的菜单项
            const childItems = config.menuItems.filter((item: any) => item.parentId);
            for (const item of childItems) {
                // 使用映射表中的新 parentId
                const newParentId = idMap.get(item.parentId);
                await db.menuItem.create({
                    data: {
                        userId: 'default-admin',
                        label: item.label,
                        icon: item.icon,
                        toolId: item.toolId,
                        parentId: newParentId || null,
                        order: item.order,
                        isFolder: item.isFolder ?? false,
                    }
                });
            }
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Import configuration error:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to import configuration' 
        };
    }
}
