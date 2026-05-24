import { db } from '@/lib/db';
import { SidebarNav } from './sidebar-nav';
import { getLocale } from 'next-intl/server';
import { getProxyServicesForNavigation } from '@/actions/proxy-service';

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

    const proxyServices = await getProxyServicesForNavigation();

    const proxyMenuGroup = proxyServices.length > 0 ? {
        id: 'proxy-services-group',
        userId: 'default-admin',
        parentId: null,
        toolId: null,
        label: '代理服务',
        labelEn: 'Proxy Services',
        icon: 'Waypoints',
        order: 9999,
        isFolder: true,
        tool: null,
        children: proxyServices.map((service, index) => ({
            id: `proxy-service-${service.code}`,
            userId: 'default-admin',
            parentId: 'proxy-services-group',
            toolId: null,
            label: service.name,
            labelEn: service.name,
            icon: service.code === 'brave-search' ? 'Search' : 'Waypoints',
            order: index,
            isFolder: false,
            tool: null,
            href: `/${locale}/admin/proxy-services/${service.code}`,
        })),
    } : null;

    const sidebarItems = proxyMenuGroup
        ? [...menuItems, proxyMenuGroup]
        : menuItems;

    return (
        <SidebarNav items={sidebarItems} locale={locale} />
    );
}
