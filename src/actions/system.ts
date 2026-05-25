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
    weatherQueryKeyName?: string;
    weatherHeaderName?: string;
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
        let config = await db.systemConfig.findFirst();

        // If config doesn't exist, create it (auto-recovery)
        if (!config) {
            config = await db.systemConfig.create({
                data: {
                    isInitialized: true,
                    defaultLocale: 'zh',
                    defaultTheme: 'system',
                    dashboardQuickTools: 'json-formatter,uuid-generator,timestamp-converter,password-generator',
                }
            });
        }

        const updateData: any = {};

        if (data.defaultLocale !== undefined) updateData.defaultLocale = data.defaultLocale;
        if (data.defaultTheme !== undefined) updateData.defaultTheme = data.defaultTheme;
        if (data.dashboardQuickTools !== undefined) updateData.dashboardQuickTools = data.dashboardQuickTools;
        if (data.weatherEnabled !== undefined) updateData.weatherEnabled = data.weatherEnabled;
        if (data.weatherUrl !== undefined) updateData.weatherUrl = data.weatherUrl;
        if (data.weatherApiKey !== undefined) updateData.weatherApiKey = data.weatherApiKey;
        if (data.weatherKeyMode !== undefined) updateData.weatherKeyMode = data.weatherKeyMode;
        if (data.weatherCity !== undefined) updateData.weatherCity = data.weatherCity;
        if (data.weatherQueryKeyName !== undefined) updateData.weatherQueryKeyName = data.weatherQueryKeyName;
        if (data.weatherHeaderName !== undefined) updateData.weatherHeaderName = data.weatherHeaderName;
        if (data.translatorProviderId !== undefined) updateData.translatorProviderId = data.translatorProviderId;
        if (data.translatorSystemPrompt !== undefined) updateData.translatorSystemPrompt = data.translatorSystemPrompt;
        if (data.varNameGenProviderId !== undefined) updateData.varNameGenProviderId = data.varNameGenProviderId;
        if (data.varNameGenSystemPrompt !== undefined) updateData.varNameGenSystemPrompt = data.varNameGenSystemPrompt;
        if (data.githubToken !== undefined) updateData.githubToken = data.githubToken;

        if (Object.keys(updateData).length > 0) {
            await db.systemConfig.update({
                where: { id: config.id },
                data: updateData,
            });
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
                type: true,
                baseUrl: true,
                apiKey: true,
                model: true,
                isDefault: true,
                isActive: true,
                order: true,
            }
        });

        // 获取 TinyPNG 账号配置
        const tinyPngAccounts = await db.tinyPngAccount.findMany({
            select: {
                id: true,
                name: true,
                apiKey: true,
                isActive: true,
                order: true,
            }
        });

        // 获取 Cloudinary 账号配置
        const cloudinaryAccounts = await db.cloudinaryAccount.findMany({
            select: {
                id: true,
                name: true,
                cloudName: true,
                apiKey: true,
                apiSecret: true,
                isActive: true,
                order: true,
            }
        });

        // 获取代理服务配置（敏感密钥不导出）
        const proxyServices = await db.proxyService.findMany({
            select: {
                code: true,
                name: true,
                providerType: true,
                baseUrl: true,
                timeoutMs: true,
                retryCount: true,
                isActive: true,
                upstreamKeys: {
                    select: {
                        name: true,
                        isActive: true,
                        order: true,
                    },
                    orderBy: [
                        { order: 'asc' },
                        { createdAt: 'asc' },
                    ],
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        // 获取菜单配置
        const menuItems = await db.menuItem.findMany({
            where: { userId: 'default-admin' },
            select: {
                id: true,
                label: true,
                labelEn: true,
                icon: true,
                toolId: true,
                tool: {
                    select: {
                        component: true
                    }
                },
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
                githubToken: systemConfig?.githubToken,
                proxyGatewayApiKeyHint: systemConfig?.proxyGatewayApiKeyHint,
            },
            aiProviders,
            tinyPngAccounts,
            cloudinaryAccounts,
            proxyServices,
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
                        type: provider.type || 'openai',
                        baseUrl: provider.baseUrl,
                        apiKey: provider.apiKey,
                        model: provider.model,
                        isDefault: provider.isDefault ?? false,
                        isActive: provider.isActive ?? true,
                        order: provider.order ?? 0,
                    }
                });
            }
        }

        // 导入 TinyPNG 账号配置
        if (config.tinyPngAccounts && Array.isArray(config.tinyPngAccounts)) {
            // 先删除现有的账号
            await db.tinyPngAccount.deleteMany({});

            // 导入新的账号
            for (const account of config.tinyPngAccounts) {
                await db.tinyPngAccount.create({
                    data: {
                        name: account.name,
                        apiKey: account.apiKey,
                        isActive: account.isActive ?? true,
                        order: account.order ?? 0,
                    }
                });
            }
        }

        // 导入 Cloudinary 账号配置
        if (config.cloudinaryAccounts && Array.isArray(config.cloudinaryAccounts)) {
            // 先删除现有的账号
            await db.cloudinaryAccount.deleteMany({});

            // 导入新的账号
            for (const account of config.cloudinaryAccounts) {
                await db.cloudinaryAccount.create({
                    data: {
                        name: account.name,
                        cloudName: account.cloudName,
                        apiKey: account.apiKey,
                        apiSecret: account.apiSecret,
                        isActive: account.isActive ?? true,
                        order: account.order ?? 0,
                    }
                });
            }
        }

        // 导入代理服务基础配置（不覆盖真实密钥）
        if (config.proxyServices && Array.isArray(config.proxyServices)) {
            for (const service of config.proxyServices) {
                const existing = await db.proxyService.findUnique({
                    where: { code: service.code },
                });

                if (existing) {
                    await db.proxyService.update({
                        where: { id: existing.id },
                        data: {
                            name: service.name,
                            providerType: service.providerType,
                            baseUrl: service.baseUrl,
                            timeoutMs: service.timeoutMs ?? 15000,
                            retryCount: service.retryCount ?? 2,
                            isActive: service.isActive ?? true,
                        },
                    });
                } else {
                    await db.proxyService.create({
                        data: {
                            code: service.code,
                            name: service.name,
                            providerType: service.providerType,
                            baseUrl: service.baseUrl,
                            timeoutMs: service.timeoutMs ?? 15000,
                            retryCount: service.retryCount ?? 2,
                            isActive: service.isActive ?? true,
                        },
                    });
                }
            }
        }


        // 导入菜单配置
        if (config.menuItems && Array.isArray(config.menuItems)) {
            // 获取现有所有工具的映射表 (Component -> ID)
            const tools = await db.tool.findMany();
            const toolMap = new Map<string, string>();
            tools.forEach((tool: any) => {
                toolMap.set(tool.component, tool.id);
            });

            // 先删除现有的菜单
            await db.menuItem.deleteMany({
                where: { userId: 'default-admin' }
            });

            // 创建 ID 映射表（旧 ID -> 新 ID）
            const idMap = new Map<string, string>();

            // 使用队列处理分层创建，解决父子依赖
            let remainingItems = [...config.menuItems];
            let hasProgress = true;

            while (remainingItems.length > 0 && hasProgress) {
                hasProgress = false;
                const nextBatch = [];
                const delayed = [];

                for (const item of remainingItems) {
                    // 1. 如果是根节点，直接创建
                    // 2. 如果父节点已创建，可以创建
                    if (!item.parentId || idMap.has(item.parentId)) {
                        nextBatch.push(item);
                    } else {
                        delayed.push(item);
                    }
                }

                // 如果没有可处理的项，说明存在循环依赖或孤立项，强制处理
                if (nextBatch.length === 0 && delayed.length > 0) {
                    console.warn('Import menu: Found orphan items or circular dependencies, creating as root items.');
                    // 将剩余所有项作为根项处理（或者跳过）
                    // 这里选择作为根项处理，避免数据丢失
                    nextBatch.push(...delayed);
                    delayed.length = 0;
                }

                for (const item of nextBatch) {
                    // 解析新的 parentId
                    const newParentId = item.parentId ? idMap.get(item.parentId) : null;

                    // 解析新的 toolId
                    let newToolId = null;
                    if (item.tool && item.tool.component) {
                        // 如果导出包含 component 信息，优先使用 component 匹配
                        newToolId = toolMap.get(item.tool.component);
                    } else if (item.toolId) {
                        // 如果只有 toolId，尝试查找是否有同 ID 的工具（虽然不太可能匹配，但作为兜底）
                        // 注意：这里的逻辑是假设如果 ID 相同则匹配，但在不同 DB 间通常 ID 不同
                        // 为了兼容性，如果找不到 Component 匹配，我们置空 toolId 避免外键错误，或者跳过
                        // 既然不能确定 toolId 是否有效，最好是先验证
                        const exists = await db.tool.findUnique({ where: { id: item.toolId } });
                        if (exists) {
                            newToolId = item.toolId;
                        } else {
                            // 尝试通过 ID 在 toolMap 中反向查找? 不，ID 变了。
                            // 如果没有 component 信息，我们无法可靠地恢复工具关联。
                            console.warn(`Import menu: Cannot resolve tool for item ${item.label}. Tool association lost.`);
                        }
                    }

                    try {
                        const newItem = await db.menuItem.create({
                            data: {
                                userId: 'default-admin',
                                label: item.label,
                                labelEn: item.labelEn,
                                icon: item.icon,
                                toolId: newToolId, // 如果为 null，则变成了文件夹或无链接节点
                                parentId: newParentId || null,
                                order: item.order,
                                isFolder: item.isFolder ?? false,
                            }
                        });
                        idMap.set(item.id, newItem.id);
                        hasProgress = true;
                    } catch (e) {
                        console.error(`Import menu: Failed to create item ${item.label}`, e);
                    }
                }

                remainingItems = delayed;
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
