'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { completeInitialization } from '@/actions/init';
import { toast } from 'sonner';
import { Loader2, Check, Globe, User } from 'lucide-react';

type Step = 1 | 2;

export default function InitPage() {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('Init');

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form data
    const [selectedLocale, setSelectedLocale] = useState(locale);
    const [adminAccount, setAdminAccount] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleLocaleChange = (value: string) => {
        setSelectedLocale(value);
        router.push(`/${value}/init`);
    };

    const handleNext = () => {
        if (currentStep < 2) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleComplete = async () => {
        if (adminAccount.password !== adminAccount.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (adminAccount.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('email', adminAccount.email);
        formData.append('password', adminAccount.password);
        formData.append('confirmPassword', adminAccount.confirmPassword);
        formData.append('locale', selectedLocale);
        formData.append('dbType', 'sqlite'); // Always use SQLite

        const result = await completeInitialization(formData);

        if (result.success) {
            toast.success('Initialization completed successfully!');
            // Don't set isLoading to false here to show waiting state during redirect
            router.push(`/${selectedLocale}/admin/dashboard`);
        } else {
            setIsLoading(false);
            toast.error(result.error || 'Initialization failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
                {[1, 2].map((step) => (
                    <div key={step} className="flex items-center">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-gray-300 text-gray-400'
                                }`}
                        >
                            {currentStep > step ? (
                                <Check className="w-5 h-5" />
                            ) : step === 1 ? (
                                <Globe className="w-5 h-5" />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </div>
                        {step < 2 && (
                            <div
                                className={`w-32 h-1 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-gray-300'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Language Selection */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">{t('welcome')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('languageSelection')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="locale">{t('language')}</Label>
                        <Select value={selectedLocale} onValueChange={handleLocaleChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="zh">中文</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleNext}>{t('next')}</Button>
                    </div>
                </div>
            )}

            {/* Step 2: Admin Account Creation */}
            {currentStep === 2 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">{t('adminAccount')}</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('adminAccountDesc')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={adminAccount.email}
                                onChange={(e) => setAdminAccount({ ...adminAccount, email: e.target.value })}
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                value={adminAccount.password}
                                onChange={(e) => setAdminAccount({ ...adminAccount, password: e.target.value })}
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={adminAccount.confirmPassword}
                                onChange={(e) => setAdminAccount({ ...adminAccount, confirmPassword: e.target.value })}
                                placeholder="Re-enter password"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={handleBack}>{t('back')}</Button>
                        <Button onClick={handleComplete} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? t('processing') : t('completeSetup')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
