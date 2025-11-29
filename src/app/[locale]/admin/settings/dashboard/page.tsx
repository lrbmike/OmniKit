import { getTranslations } from 'next-intl/server';
import { getSystemConfig } from '@/actions/system';
import { getTools } from '@/actions/menu';
import { DashboardSettingsForm } from '@/components/admin/dashboard-settings-form';
import { DEFAULT_QUICK_TOOLS } from '@/lib/constants';

export default async function DashboardSettingsPage() {
    const t = await getTranslations('Settings.pages.dashboard');
    const config = await getSystemConfig();
    const tools = await getTools();

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
            <DashboardSettingsForm
                initialConfig={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    dashboardQuickTools: (config as any).dashboardQuickTools || DEFAULT_QUICK_TOOLS.join(',')
                }}
                tools={tools}
            />
        </div>
    );
}
