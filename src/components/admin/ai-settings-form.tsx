'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { updateSystemConfig } from '@/actions/system';
import { toast } from 'sonner';

interface AiSettingsFormProps {
    initialConfig: {
        aiProvider: string;
        aiBaseUrl: string;
        aiApiKey: string | null;
        aiModel: string;
        aiSystemPrompt: string;
    };
}

const DEFAULT_SYSTEM_PROMPT = "You are a professional translator. Translate the following text from {sourceLang} to {targetLang}.\n\nText to translate:\n{context}\n\nOutput only the translated text.";

export function AiSettingsForm({ initialConfig }: AiSettingsFormProps) {
    const t = useTranslations('Settings.pages.ai');
    const [provider, setProvider] = useState(initialConfig.aiProvider || 'openai');
    const [baseUrl, setBaseUrl] = useState(initialConfig.aiBaseUrl || 'https://api.openai.com/v1');
    const [apiKey, setApiKey] = useState(initialConfig.aiApiKey || '');
    const [model, setModel] = useState(initialConfig.aiModel || 'gpt-3.5-turbo');
    const [systemPrompt, setSystemPrompt] = useState(initialConfig.aiSystemPrompt || DEFAULT_SYSTEM_PROMPT);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateSystemConfig({
                aiProvider: provider,
                aiBaseUrl: baseUrl,
                aiApiKey: apiKey,
                aiModel: model,
                aiSystemPrompt: systemPrompt,
            });

            if (result.success) {
                toast.success(t('saveSuccess'));
            } else {
                toast.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPrompt = () => {
        setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
        toast.success(t('promptReset'));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="provider">{t('provider')}</Label>
                    <Select value={provider} onValueChange={setProvider}>
                        <SelectTrigger id="provider">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="openai">OpenAI Compatible</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="baseUrl">{t('baseUrl')}</Label>
                        <Input
                            id="baseUrl"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://api.openai.com/v1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="model">{t('model')}</Label>
                        <Input
                            id="model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="gpt-3.5-turbo"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="apiKey">{t('apiKey')}</Label>
                    <Input
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        type="password"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="systemPrompt">{t('systemPrompt')}</Label>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleResetPrompt}
                            type="button"
                        >
                            {t('resetPrompt')}
                        </Button>
                    </div>
                    <Textarea
                        id="systemPrompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Enter system prompt..."
                        className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                        {t('systemPromptDesc')}
                    </p>
                </div>

                <Button onClick={handleSave} disabled={isLoading}>
                    {t('saveChanges')}
                </Button>
            </CardContent>
        </Card>
    );
}
