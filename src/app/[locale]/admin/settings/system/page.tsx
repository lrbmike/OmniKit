import { getTranslations } from 'next-intl/server';
import { getSystemConfig } from '@/actions/system';
import { SystemSettingsForm } from '@/components/admin/system-settings-form';

export default async function SystemSettingsPage() {
    const t = await getTranslations('Settings.pages.system');
    const config = await getSystemConfig();

    if (!config) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">{t('title')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t('description')}
                    </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <p className="text-sm text-red-700 dark:text-red-400">
                        System configuration not found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('description')}
                </p>
            </div>
            <SystemSettingsForm
                initialConfig={{
                    defaultLocale: config.defaultLocale,
                    defaultTheme: config.defaultTheme,
                }}
            />
        </div>
    );
}
