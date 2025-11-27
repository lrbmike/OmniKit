'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';
import { LogOut, Menu } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebar-store';

export function Header() {
    const toggleSidebar = useSidebarStore((state) => state.toggle);

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="md:hidden mr-4" onClick={toggleSidebar}>
                    <Menu className="h-6 w-6" />
                </Button>
                {/* Breadcrumbs or Page Title could go here */}
            </div>

            <div className="flex items-center space-x-4">
                <LanguageSwitcher />
                <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
