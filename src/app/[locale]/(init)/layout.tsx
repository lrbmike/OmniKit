import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { isSystemInitialized } from '@/lib/init';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function InitLayout({ children }: { children: ReactNode }) {
    const initialized = await isSystemInitialized();
    const locale = await getLocale();

    if (initialized) {
        redirect(`/${locale}/admin/dashboard`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            OmniKit
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Multi-Tool Admin System
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        {children}
                    </div>
                </div>
            </div>
            <Toaster richColors position="top-center" />
        </div>
    );
}
