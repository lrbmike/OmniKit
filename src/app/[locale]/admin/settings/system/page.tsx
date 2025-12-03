import { getTranslations } from 'next-intl/server';
import { getSystemConfig } from '@/actions/system';
import { SystemSettingsForm } from '@/components/admin/system-settings-form';

export default async function SystemSettingsPage() {
    const t = await getTranslations('Settings.pages.system');
    const config = await getSystemConfig();

    // Use default values if config is missing (fail-safe)
    const defaultConfig = {
        defaultLocale: 'zh',
        defaultTheme: 'system',
    };

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
                    defaultLocale: config?.defaultLocale || defaultConfig.defaultLocale,
                    defaultTheme: config?.defaultTheme || defaultConfig.defaultTheme,
                }}
            />
        </div>
    );
}
