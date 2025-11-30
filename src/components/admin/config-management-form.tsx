'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { exportConfiguration, importConfiguration } from '@/actions/system';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';

export function ConfigManagementForm() {
    const t = useTranslations('Settings.pages.config');
    const tCommon = useTranslations('Settings.pages.system');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const result = await exportConfiguration();
            
            if (result.success && result.data) {
                // 创建 Blob 并下载
                const blob = new Blob([result.data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `omnikit-config-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                toast.success(t('exportSuccess'));
            } else {
                toast.error(result.error || 'Failed to export configuration');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const text = await file.text();
            const result = await importConfiguration(text);
            
            if (result.success) {
                toast.success(t('importSuccess'));
                // 刷新页面以应用新配置
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error(result.error || 'Failed to import configuration');
            }
        } catch (error) {
            toast.error('Invalid configuration file');
        } finally {
            setIsLoading(false);
            // 重置文件输入
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('title')}</h3>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>{t('cardTitle')}</CardTitle>
                    <CardDescription>{t('cardDescription')}</CardDescription>
                </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                        onClick={handleExport} 
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {t('exportConfig')}
                    </Button>
                    
                    <Button 
                        onClick={triggerFileInput} 
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {t('importConfig')}
                    </Button>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
                
                <div className="text-sm text-muted-foreground space-y-2">
                    <p>{t('configInfo')}</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>{t('configIncludesSystem')}</li>
                        <li>{t('configIncludesAI')}</li>
                        <li>{t('configIncludesMenu')}</li>
                    </ul>
                    <p className="text-amber-600 dark:text-amber-500 font-medium">
                        ⚠️ {t('configWarning')}
                    </p>
                </div>
            </CardContent>
        </Card>
        </div>
    );
}
