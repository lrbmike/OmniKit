'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSystemConfig } from '@/actions/system';
import { QuickToolSelector } from '@/components/admin/quick-tool-selector';
import { toast } from 'sonner';

interface Tool {
    id: string;
    name: string;
    nameEn: string;
    description: string | null;
    descriptionEn: string | null;
    icon: string;
    component: string;
    category: string;
}

interface DashboardSettingsFormProps {
    initialConfig: {
        dashboardQuickTools?: string;
    };
    tools: Tool[];
}

export function DashboardSettingsForm({ initialConfig, tools }: DashboardSettingsFormProps) {
    const t = useTranslations('Settings.pages.dashboard'); // Will need to add this namespace
    const tSystem = useTranslations('Settings.pages.system'); // Reuse some translations
    const [quickTools, setQuickTools] = useState<string[]>(
        initialConfig.dashboardQuickTools ? initialConfig.dashboardQuickTools.split(',') : []
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveConfig = async () => {
        setIsLoading(true);
        try {
            const result = await updateSystemConfig({
                dashboardQuickTools: quickTools.join(','),
            });

            if (result.success) {
                toast.success(tSystem('configUpdated'));
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
            <Card>
                <CardHeader>
                    <CardTitle>{t('quickToolsTitle')}</CardTitle>
                    <CardDescription>{t('quickToolsDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <QuickToolSelector 
                            tools={tools} 
                            selectedTools={quickTools} 
                            onChange={setQuickTools} 
                            maxTools={4}
                        />
                    </div>

                    <Button onClick={handleSaveConfig} disabled={isLoading}>
                        {tSystem('saveChanges')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
