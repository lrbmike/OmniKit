'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';
import { LogOut, Menu, Settings } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { HeaderSearch } from './header-search';
import { HeaderWeather } from './header-weather';

interface Tool {
    id: string;
    name: string;
    nameEn: string;
    description: string | null;
    descriptionEn: string | null;
    icon: string;
    component: string;
    category: string;
}

interface HeaderProps {
    tools?: Tool[];
}

export function Header({ tools = [] }: HeaderProps) {
    const toggleSidebar = useSidebarStore((state) => state.toggle);
    const locale = useLocale();

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
            <div className="flex items-center flex-1 gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
                    <Menu className="h-6 w-6" />
                </Button>
                
                {/* Search Bar - takes available space but max width */}
                <div className="flex-1 max-w-md hidden md:block">
                    <HeaderSearch tools={tools} locale={locale} />
                </div>
                <div className="md:hidden flex-1"></div> {/* Spacer for mobile */}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
                <HeaderWeather />
                
                <div className="flex items-center space-x-1 sm:space-x-2 border-l border-gray-200 dark:border-gray-700 pl-2 sm:pl-4">
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <Link href={`/${locale}/admin/settings/menu`}>
                        <Button variant="ghost" size="icon" title="Settings" className="hidden sm:flex">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
