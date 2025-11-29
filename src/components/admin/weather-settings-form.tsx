'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSystemConfig } from '@/actions/system';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

interface WeatherSettingsFormProps {
    initialConfig: {
        weatherEnabled: boolean;
        weatherUrl: string;
        weatherApiKey: string | null;
        weatherKeyMode: string;
        weatherCity: string;
    };
}

export function WeatherSettingsForm({ initialConfig }: WeatherSettingsFormProps) {
    const t = useTranslations('Settings.pages.weather');
    const [enabled, setEnabled] = useState(initialConfig.weatherEnabled || false);
    const [url, setUrl] = useState(initialConfig.weatherUrl || 'http://api.weatherstack.com/current');
    const [apiKey, setApiKey] = useState(initialConfig.weatherApiKey || '');
    const [keyMode, setKeyMode] = useState(initialConfig.weatherKeyMode || 'query');
    const [city, setCity] = useState(initialConfig.weatherCity || 'Beijing');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateSystemConfig({
                weatherEnabled: enabled,
                weatherUrl: url,
                weatherApiKey: apiKey,
                weatherKeyMode: keyMode,
                weatherCity: city,
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
                    <div className="space-y-0.5">
                        <Label htmlFor="enabled" className="text-base font-medium">
                            {t('enabled')}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                            {enabled ? 'On' : 'Off'}
                        </div>
                    </div>
                    <Switch
                        id="enabled"
                        checked={enabled}
                        onCheckedChange={setEnabled}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="url">{t('url')}</Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="http://api.weatherstack.com/current"
                            disabled={!enabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">{t('city')}</Label>
                        <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Beijing"
                            disabled={!enabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="apiKey">{t('apiKey')}</Label>
                            <a 
                                href="https://docs.apilayer.com/weatherstack/docs/quickstart-guide" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                            >
                                {t('getKey')}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                        <Input
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Your API Key"
                            type="password"
                            disabled={!enabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="keyMode">{t('keyMode')}</Label>
                        <Select value={keyMode} onValueChange={setKeyMode} disabled={!enabled}>
                            <SelectTrigger id="keyMode">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="query">{t('query')}</SelectItem>
                                <SelectItem value="header">{t('header')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={isLoading}>
                    {useTranslations('Settings.pages.system')('saveChanges')}
                </Button>
            </CardContent>
        </Card>
    );
}
