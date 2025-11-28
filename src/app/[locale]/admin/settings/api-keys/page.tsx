import { useTranslations } from 'next-intl';

export default function ApiKeysSettingsPage() {
    const t = useTranslations('Settings.pages.apiKeys');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('description')}
                </p>
            </div>
            <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    {t('comingSoon')}
                </p>
            </div>
        </div>
    );
}
