import { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
