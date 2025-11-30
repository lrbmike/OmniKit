'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateGithubConfig } from '@/actions/github';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

interface GithubSettingsFormProps {
    initialConfig: {
        githubToken: string;
    };
}

export function GithubSettingsForm({ initialConfig }: GithubSettingsFormProps) {
    const t = useTranslations('Settings.pages.github');
    const [githubToken, setGithubToken] = useState(initialConfig.githubToken);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateGithubConfig({
                githubToken,
            });

            if (result.success) {
                toast.success(t('saveSuccess'));
            } else {
                toast.error(result.error || 'Failed to update settings');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('tokenConfig')}</CardTitle>
                    <CardDescription>{t('tokenConfigDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="githubToken">{t('token')}</Label>
                        <Input
                            id="githubToken"
                            type="password"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder={t('tokenPlaceholder')}
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{t('tokenHint')}</span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0"
                                onClick={() => window.open('https://github.com/settings/tokens/new', '_blank')}
                            >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                {t('getToken')}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                        <p className="text-sm font-medium">{t('permissions')}</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                            <li>{t('permissionRepo')}</li>
                        </ul>
                    </div>

                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? t('saving') : t('saveChanges')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
