'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSystemConfig, updatePassword, exportConfiguration, importConfiguration } from '@/actions/system';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';

interface SystemSettingsFormProps {
    initialConfig: {
        defaultLocale: string;
        defaultTheme: string;
    };
}

export function SystemSettingsForm({ initialConfig }: SystemSettingsFormProps) {
    const t = useTranslations('Settings.pages.system');
    const { theme, setTheme } = useTheme();
    const [defaultLocale, setDefaultLocale] = useState(initialConfig.defaultLocale);
    const [currentTheme, setCurrentTheme] = useState<string>(initialConfig.defaultTheme);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 同步浏览器当前主题到表单（如果用户通过 header 切换了主题）
    useEffect(() => {
        if (theme && theme !== currentTheme) {
            setCurrentTheme(theme);
        }
    }, [theme]);

    const handleSaveConfig = async () => {
        setIsLoading(true);
        try {
            // 更新系统配置
            const result = await updateSystemConfig({
                defaultLocale,
                defaultTheme: currentTheme,
            });

            if (result.success) {
                // 同时更新当前用户的主题
                setTheme(currentTheme);
                toast.success(t('configUpdated'));
            } else {
                toast.error(result.error || 'Failed to update settings');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error(t('passwordMismatch'));
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const result = await updatePassword(newPassword);

            if (result.success) {
                toast.success(t('passwordUpdated'));
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(result.error || 'Failed to update password');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

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
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('general')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="language">{t('language')}</Label>
                            <Select value={defaultLocale} onValueChange={setDefaultLocale}>
                                <SelectTrigger id="language">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="zh">中文</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="theme">{t('theme')}</Label>
                            <Select value={currentTheme} onValueChange={setCurrentTheme}>
                                <SelectTrigger id="theme">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">{t('themeLight')}</SelectItem>
                                    <SelectItem value="dark">{t('themeDark')}</SelectItem>
                                    <SelectItem value="system">{t('themeSystem')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={handleSaveConfig} disabled={isLoading}>
                        {t('saveChanges')}
                    </Button>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('security')}</CardTitle>
                    <CardDescription>{t('resetPassword')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">{t('newPassword')}</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <Button onClick={handleResetPassword} disabled={isLoading}>
                        {t('saveChanges')}
                    </Button>
                </CardContent>
            </Card>

            {/* Configuration Import/Export */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('configManagement')}</CardTitle>
                    <CardDescription>{t('configManagementDescription')}</CardDescription>
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
