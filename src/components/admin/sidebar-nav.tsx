'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconRenderer } from '@/components/icon-renderer';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';

// Define types locally matching the Prisma return type structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuItem = any;

export function SidebarNav({ items, locale }: { items: MenuItem[], locale: string }) {
    const pathname = usePathname();
    const { isOpen, close } = useSidebarStore();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={close}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-full flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <h1 className="text-2xl font-bold text-primary">OmniKit</h1>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <Link
                        href={`/${locale}/admin/dashboard`}
                        className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            pathname === `/${locale}/admin/dashboard`
                                ? "bg-primary/10 text-primary"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        onClick={() => window.innerWidth < 768 && close()}
                    >
                        <IconRenderer name="LayoutDashboard" className="mr-3 h-5 w-5" />
                        Dashboard
                    </Link>

                    {items.map((item) => (
                        <SidebarItem key={item.id} item={item} locale={locale} pathname={pathname} closeSidebar={close} />
                    ))}

                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href={`/${locale}/admin/settings/menu`}
                            className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname.includes('/admin/settings')
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                            onClick={() => window.innerWidth < 768 && close()}
                        >
                            <Settings className="mr-3 h-5 w-5" />
                            Settings
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}

function SidebarItem({ item, locale, pathname, closeSidebar }: { item: MenuItem, locale: string, pathname: string, closeSidebar: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const label = locale === 'zh' ? (item.label || item.tool?.name) : (item.labelEn || item.tool?.nameEn);
    const iconName = item.icon || item.tool?.icon || 'Circle';

    if (item.isFolder) {
        return (
            <div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <IconRenderer name={iconName} className="mr-3 h-5 w-5" />
                    <span className="flex-1 text-left">{label}</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {isExpanded && item.children && (
                    <div className="pl-4 mt-1 space-y-1">
                        {item.children.map((child: MenuItem) => (
                            <SidebarItem key={child.id} item={child} locale={locale} pathname={pathname} closeSidebar={closeSidebar} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const href = `/${locale}/admin/tools/${item.tool?.component}`;
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            onClick={() => window.innerWidth < 768 && closeSidebar()}
        >
            <IconRenderer name={iconName} className="mr-3 h-5 w-5" />
            {label}
        </Link>
    );
}
