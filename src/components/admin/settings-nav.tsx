'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { LayoutGrid, Database, Key, Settings as SettingsIcon, LayoutDashboard, CloudSun, Languages } from 'lucide-react';

export function SettingsNav() {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('Settings.nav');
    const tPages = useTranslations('Settings.pages.weather');
    const tAi = useTranslations('Settings.pages.ai');

    const items = [
        {
            title: t('menu'),
            href: `/${locale}/admin/settings/menu`,
            icon: LayoutGrid
        },
        {
            title: t('dashboard'),
            href: `/${locale}/admin/settings/dashboard`,
            icon: LayoutDashboard
        },
        {
            title: t('system'),
            href: `/${locale}/admin/settings/system`,
            icon: SettingsIcon
        },
        {
            title: tPages('title'),
            href: `/${locale}/admin/settings/weather`,
            icon: CloudSun
        },
        {
            title: tAi('title'),
            href: `/${locale}/admin/settings/ai`,
            icon: Languages
        },
        {
            title: t('apiKeys'),
            href: `/${locale}/admin/settings/api-keys`,
            icon: Key
        }
    ];

    return (
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-primary"
                        )}
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
