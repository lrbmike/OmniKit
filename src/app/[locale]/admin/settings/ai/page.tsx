import { getSystemConfig } from '@/actions/system';
import { AiSettingsForm } from '@/components/admin/ai-settings-form';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';

export default async function AiSettingsPage() {
    const t = await getTranslations('Settings.pages.ai');
    const config = await getSystemConfig();

    const initialConfig = {
        aiProvider: config?.aiProvider || 'openai',
        aiBaseUrl: config?.aiBaseUrl || 'https://api.openai.com/v1',
        aiApiKey: config?.aiApiKey || '',
        aiModel: config?.aiModel || 'gpt-3.5-turbo',
        aiSystemPrompt: config?.aiSystemPrompt || "You are a professional translator. Translate the text to the target language. Output only the translated text.",
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
            <AiSettingsForm initialConfig={initialConfig} />
        </div>
    );
}
