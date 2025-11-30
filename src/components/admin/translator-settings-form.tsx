'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { updateSystemConfig } from '@/actions/system';
import { toast } from 'sonner';
import type { AiProvider } from '@/actions/ai-provider';
import { Link2 } from 'lucide-react';

interface TranslatorSettingsFormProps {
    initialConfig: {
        translatorProviderId: string;
        translatorSystemPrompt: string;
    };
    providers: AiProvider[];
}

const DEFAULT_SYSTEM_PROMPT = "You are a professional translator. Translate the following text from {sourceLang} to {targetLang}.\n\nText to translate:\n{context}\n\nOutput only the translated text.";

export function TranslatorSettingsForm({ initialConfig, providers }: TranslatorSettingsFormProps) {
    const t = useTranslations('Settings.pages.ai');
    const [providerId, setProviderId] = useState(initialConfig.translatorProviderId);
    const [systemPrompt, setSystemPrompt] = useState(initialConfig.translatorSystemPrompt);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!providerId) {
            toast.error(t('errorSelectProvider'));
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateSystemConfig({
                translatorProviderId: providerId,
                translatorSystemPrompt: systemPrompt,
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

    const selectedProvider = providers.find(p => p.id === providerId);

    return (
        <Card>
            <CardContent className="space-y-6 pt-6">
                {providers.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                            {t('noProvidersHint')}
                        </p>
                        <Button asChild>
                            <a href="/admin/settings/ai-providers">
                                <Link2 className="mr-2 h-4 w-4" />
                                {t('goToProviders')}
                            </a>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="provider">{t('selectProvider')}</Label>
                            <Select value={providerId} onValueChange={setProviderId}>
                                <SelectTrigger id="provider">
                                    <SelectValue placeholder={t('selectProviderPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.map((provider) => (
                                        <SelectItem key={provider.id} value={provider.id}>
                                            {provider.name} ({provider.model})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedProvider && (
                                <p className="text-xs text-muted-foreground">
                                    {t('providerInfo')}: {selectedProvider.baseUrl}
                                </p>
                            )}
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

                        <Button onClick={handleSave} disabled={isLoading || !providerId}>
                            {t('saveChanges')}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
