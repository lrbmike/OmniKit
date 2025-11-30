'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Link2 } from 'lucide-react';
import { getSystemConfig, updateSystemConfig } from '@/actions/system';
import { getActiveAiProviders } from '@/actions/ai-provider';
import { useLocale } from 'next-intl';

const DEFAULT_PROMPT = `You are an experienced developer. Generate English variable names based on user input.

User input: {context}

Generate variable names in different formats:
- URL: web URL format (lowercase, hyphen-separated)
- Variable: camelCase variable name
- File: file name format (lowercase, hyphen-separated)
- Route: route path format (lowercase, slash-separated)

Provide both normal length and shortened versions.

Output in JSON format:
{
  "normal": {
    "url": "enterprise-certification",
    "var_name": "enterpriseCertification",
    "file_name": "enterprise-certification",
    "route": "/enterprise/certification"
  },
  "short": {
    "url": "ent-cert",
    "var_name": "entCert",
    "file_name": "ent-cert",
    "route": "/ent/cert"
  }
}`;

export default function VarNameGenSettingsForm() {
    const t = useTranslations('Settings.pages.varNameGen');
    const locale = useLocale();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [providerId, setProviderId] = useState<string>('');
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
    const [providers, setProviders] = useState<Array<{ id: string; name: string; model: string; baseUrl: string }>>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [configResult, providersResult] = await Promise.all([
                getSystemConfig(),
                getActiveAiProviders()
            ]);

            if (configResult) {
                setProviderId(configResult.varNameGenProviderId || '');
                setSystemPrompt(configResult.varNameGenSystemPrompt || DEFAULT_PROMPT);
            }

            if (providersResult.success && providersResult.data) {
                setProviders(providersResult.data);
            }
        } catch (error) {
            console.error('Load data error:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!providerId) {
            toast.error(t('errorSelectProvider'));
            return;
        }

        setSaving(true);
        try {
            const result = await updateSystemConfig({
                varNameGenProviderId: providerId,
                varNameGenSystemPrompt: systemPrompt,
            });

            if (result.success) {
                toast.success(t('saveSuccess'));
            } else {
                toast.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleResetPrompt = () => {
        setSystemPrompt(DEFAULT_PROMPT);
        toast.success(t('promptReset'));
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

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
                            <a href={`/${locale}/admin/settings/ai-providers`}>
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
                                className="min-h-[200px] font-mono text-sm"
                            />
                            <p className="text-sm text-muted-foreground">
                                {t('systemPromptDesc')}
                            </p>
                        </div>

                        <Button onClick={handleSave} disabled={saving || !providerId}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('saveChanges')}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
