import { getAiProviders } from '@/actions/ai-provider';
import { AiProvidersManager } from '@/components/admin/ai-providers-manager';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';

export default async function AiProvidersPage() {
    const t = await getTranslations('Settings.pages.aiProviders');
    const result = await getAiProviders();
    const providers = (result.success && result.data) ? result.data : [];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('description')}
                </p>
            </div>
            <Separator />
            <AiProvidersManager initialProviders={providers} />
        </div>
    );
}
