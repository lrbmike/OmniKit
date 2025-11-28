import { SettingsNav } from '@/components/admin/settings-nav';
import { SettingsHeader } from '@/components/admin/settings-header';
import { useTranslations } from 'next-intl';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = useTranslations('Settings');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            <SettingsHeader />
            <div className="flex-1 p-10 pb-16 md:block max-w-7xl mx-auto w-full bg-white dark:bg-gray-900 shadow-sm mt-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('title')}</h2>
                    <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
                        {t('description')}
                    </p>
                </div>
                <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700 my-6" />
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <aside className="-mx-4 lg:w-1/5 pl-4">
                        <SettingsNav />
                    </aside>
                    <div className="flex-1 lg:max-w-4xl">{children}</div>
                </div>
            </div>
        </div>
    );
}
