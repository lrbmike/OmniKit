'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { logout } from '@/actions/auth';

export function SettingsHeader() {
    const locale = useLocale();
    const t = useTranslations('Settings');

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <Link href={`/${locale}/admin/dashboard`}>
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                        <ArrowLeft className="h-4 w-4" />
                        {t('backToDashboard')}
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                <ThemeToggle />
                <LanguageSwitcher />
                <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
