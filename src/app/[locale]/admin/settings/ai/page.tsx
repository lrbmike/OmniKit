import { getSystemConfig } from '@/actions/system';
import { getActiveAiProviders } from '@/actions/ai-provider';
import { TranslatorSettingsForm } from '@/components/admin/translator-settings-form';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';

export default async function AiSettingsPage() {
    const t = await getTranslations('Settings.pages.ai');
    const config = await getSystemConfig();
    const providersResult = await getActiveAiProviders();
    const providers = providersResult.success ? providersResult.data : [];

    const initialConfig = {
        translatorProviderId: config?.translatorProviderId || '',
        translatorSystemPrompt: config?.translatorSystemPrompt || "You are a professional translator. Translate the following text from {sourceLang} to {targetLang}.\n\nText to translate:\n{context}\n\nOutput only the translated text.",
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">
                    {t('description')}
                </p>
            </div>
            <Separator />
            <TranslatorSettingsForm 
                initialConfig={initialConfig} 
                providers={providers}
            />
        </div>
    );
}
