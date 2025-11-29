'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSystemConfig, updatePassword } from '@/actions/system';
import { toast } from 'sonner';

interface SystemSettingsFormProps {
    initialConfig: {
        defaultLocale: string;
        defaultTheme: string;
    };
}

export function SystemSettingsForm({ initialConfig }: SystemSettingsFormProps) {
    const t = useTranslations('Settings.pages.system');
    const [defaultLocale, setDefaultLocale] = useState(initialConfig.defaultLocale);
    const [defaultTheme, setDefaultTheme] = useState(initialConfig.defaultTheme);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveConfig = async () => {
        setIsLoading(true);
        try {
            const result = await updateSystemConfig({
                defaultLocale,
                defaultTheme,
            });

            if (result.success) {
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

    return (
        <div className="space-y-6">
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('general')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        <Select value={defaultTheme} onValueChange={setDefaultTheme}>
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
        </div>
    );
}
