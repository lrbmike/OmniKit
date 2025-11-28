'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMenuItems() {
    return await db.menuItem.findMany({
        where: {
            userId: 'default-admin',
            parentId: null
        },
        include: {
            children: {
                include: { tool: true },
                orderBy: { order: 'asc' }
            },
            tool: true
        },
        orderBy: { order: 'asc' },
    });
}

export async function getTools() {
    return await db.tool.findMany({
        orderBy: { category: 'asc' },
    });
}

export async function addToolToMenu(toolId: string, parentId: string | null = null) {
    try {
        const tool = await db.tool.findUnique({ where: { id: toolId } });
        if (!tool) return { success: false, error: 'Tool not found' };

        // Get max order
        const maxOrder = await db.menuItem.findFirst({
            where: {
                userId: 'default-admin',
                parentId
            },
            orderBy: { order: 'desc' },
        });

        const newOrder = (maxOrder?.order ?? -1) + 1;

        await db.menuItem.create({
            data: {
                userId: 'default-admin',
                toolId,
                parentId,
                order: newOrder,
            },
        });

        revalidatePath('/[locale]/admin/settings/menu', 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Add tool to menu error:', error);
        return { success: false, error: 'Failed to add tool to menu' };
    }
}

export async function createFolder(name: string, parentId: string | null = null) {
    try {
        // Get max order
        const maxOrder = await db.menuItem.findFirst({
            where: {
                userId: 'default-admin',
                parentId
            },
            orderBy: { order: 'desc' },
        });

        const newOrder = (maxOrder?.order ?? -1) + 1;

        await db.menuItem.create({
            data: {
                userId: 'default-admin',
                label: name,
                isFolder: true,
                parentId,
                order: newOrder,
                icon: 'Folder',
            },
        });

        revalidatePath('/[locale]/admin/settings/menu', 'page');
        revalidatePath('/', 'layout'); // Revalidate sidebar
        return { success: true };
    } catch (error) {
        console.error('Create folder error:', error);
        return { success: false, error: 'Failed to create folder' };
    }
}

export async function updateMenuItem(id: string, data: { label?: string; icon?: string }) {
    try {
        await db.menuItem.update({
            where: { id },
            data,
        });

        revalidatePath('/[locale]/admin/settings/menu', 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Update menu item error:', error);
        return { success: false, error: 'Failed to update menu item' };
    }
}

export async function deleteMenuItem(id: string) {
    try {
        await db.menuItem.delete({
            where: { id },
        });

        revalidatePath('/[locale]/admin/settings/menu', 'page');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Delete menu item error:', error);
        return { success: false, error: 'Failed to delete menu item' };
    }
}

export async function moveMenuItem(id: string, direction: 'up' | 'down') {
    try {
        const item = await db.menuItem.findUnique({
            where: { id },
        });

        if (!item) return { success: false, error: 'Item not found' };

        const sibling = await db.menuItem.findFirst({
            where: {
                userId: 'default-admin',
                parentId: item.parentId,
                order: direction === 'up' ? { lt: item.order } : { gt: item.order },
            },
            orderBy: { order: direction === 'up' ? 'desc' : 'asc' },
        });

        if (sibling) {
            // Swap orders
            await db.$transaction([
                db.menuItem.update({
                    where: { id: item.id },
                    data: { order: sibling.order },
                }),
                db.menuItem.update({
                    where: { id: sibling.id },
                    data: { order: item.order },
                }),
            ]);

            revalidatePath('/[locale]/admin/settings/menu', 'page');
            revalidatePath('/', 'layout');
        }

        return { success: true };
    } catch (error) {
        console.error('Move menu item error:', error);
        return { success: false, error: 'Failed to move menu item' };
    }
}
