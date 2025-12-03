import { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/admin/header';
import { Footer } from '@/components/admin/footer';
import { getMenuItems } from '@/actions/menu';
import { isSystemInitialized } from '@/lib/init';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const initialized = await isSystemInitialized();
    
    if (!initialized) {
        redirect('/init');
    }

    const menuItems = await getMenuItems();
    
    // Flatten tools
    const allTools: Array<{
        id: string;
        name: string;
        nameEn: string;
        description: string | null;
        descriptionEn: string | null;
        icon: string;
        component: string;
        category: string;
    }> = [];
    
    menuItems.forEach(item => {
        if (item.tool) {
            allTools.push(item.tool);
        }
        if (item.children) {
            item.children.forEach(child => {
                if (child.tool) {
                    allTools.push(child.tool);
                }
            });
        }
    });

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header tools={allTools} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
