import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import VarNameGenSettingsForm from '@/components/admin/var-name-gen-settings-form';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Settings.pages.varNameGen');
    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function VarNameGenSettingsPage() {
    const t = await getTranslations('Settings.pages.varNameGen');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>
            <VarNameGenSettingsForm />
        </div>
    );
}
