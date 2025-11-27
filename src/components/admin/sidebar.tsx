import { db } from '@/lib/db';
import { SidebarNav } from './sidebar-nav';
import { getLocale } from 'next-intl/server';

export async function Sidebar() {
    const locale = await getLocale();

    // Fetch menu items (top level) with one level of nesting for now
    // For deeper nesting, we would need a recursive fetch or fetch-all-and-build-tree strategy
    const menuItems = await db.menuItem.findMany({
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

    return (
        <SidebarNav items={menuItems} locale={locale} />
    );
}
