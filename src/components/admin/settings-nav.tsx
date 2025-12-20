'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { LayoutGrid, Database, Settings as SettingsIcon, LayoutDashboard, CloudSun, Languages, Bot, Code2, FileJson, Upload, Cloud, Image } from 'lucide-react';

export function SettingsNav() {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('Settings.nav');
    const tPages = useTranslations('Settings.pages.weather');
    const tAi = useTranslations('Settings.pages.ai');
    const tAiProviders = useTranslations('Settings.pages.aiProviders');
    const tVarNameGen = useTranslations('Settings.pages.varNameGen');
    const tGithub = useTranslations('Settings.pages.github');
    const tCloudinary = useTranslations('Settings.pages.cloudinaryAccounts');
    const tTinyPng = useTranslations('Settings.pages.tinyPngAccounts');
    const tConfig = useTranslations('Settings.pages.config');

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
            title: tAiProviders('title'),
            href: `/${locale}/admin/settings/ai-providers`,
            icon: Bot
        },
        {
            title: tAi('title'),
            href: `/${locale}/admin/settings/translator`,
            icon: Languages
        },
        {
            title: tVarNameGen('title'),
            href: `/${locale}/admin/settings/var-name-gen`,
            icon: Code2
        },
        {
            title: tGithub('title'),
            href: `/${locale}/admin/settings/github`,
            icon: Upload
        },
        {
            title: tCloudinary('title'),
            href: `/${locale}/admin/settings/cloudinary-accounts`,
            icon: Cloud
        },
        {
            title: tTinyPng('title'),
            href: `/${locale}/admin/settings/tiny-png-accounts`,
            icon: Image
        },
        {
            title: tConfig('title'),
            href: `/${locale}/admin/settings/config`,
            icon: FileJson
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
