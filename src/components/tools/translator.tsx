'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CopyButton } from '@/components/ui/copy-button';
import { translateText } from '@/actions/ai';
import { getSystemConfig } from '@/actions/system';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowRightLeft, AlertCircle, Settings } from 'lucide-react';
import { Link, useRouter, usePathname } from '@/i18n/navigation';

type TranslationMode = 'word' | 'paragraph';

export default function Translator() {
    const t = useTranslations('Tools.Translator');
    const router = useRouter();
    const pathname = usePathname();
    const [sourceText, setSourceText] = useState('');
    const [targetText, setTargetText] = useState('');
    const [sourceLang, setSourceLang] = useState('zh');
    const [targetLang, setTargetLang] = useState('en');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null); // null = loading, true = configured, false = not configured
    const [translationMode, setTranslationMode] = useState<TranslationMode>('word');

    useEffect(() => {
        const checkConfig = async () => {
            const config = await getSystemConfig();
            setIsConfigured(!!config?.translatorProviderId);
        };
        checkConfig();
    }, []);

    useEffect(() => {
        setTargetText('');
    }, [translationMode]);

    const translationOptions: { value: TranslationMode; label: string; description: string }[] = [
        { value: 'word', label: t('wordMode'), description: t('wordModeHint') },
        { value: 'paragraph', label: t('paragraphMode'), description: t('paragraphModeHint') }
    ];

    const handleTranslate = async () => {
        if (!isConfigured) return;
        if (!sourceText.trim()) {
            toast.error(t('errorEmpty'));
            return;
        }

        setIsLoading(true);
        try {
            // Map codes to full names for the AI prompt
            const sourceLangName = sourceLang === 'zh' ? 'Chinese' : 'English';
            const targetLangName = targetLang === 'zh' ? 'Chinese' : 'English';

            const result = await translateText({ 
                text: sourceText, 
                sourceLang: sourceLangName,
                targetLang: targetLangName,
                mode: translationMode
            });

            if (result.success && result.data) {
                setTargetText(result.data);
            } else {
                toast.error(result.error || t('errorTranslation'));
            }
        } catch (error) {
            toast.error(t('errorTranslation'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwap = () => {
        const tempSource = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(tempSource);
        
        // Swap text content too if target has content
        if (targetText && !isLoading) {
            setSourceText(targetText);
            setTargetText(sourceText);
        }
    };

    const handleGoToSettings = () => {
        router.push('/admin/settings/translator');
    };

    return (
        <div className="space-y-6">
            {/* Configuration Warning Banner */}
            {isConfigured === false && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium text-destructive">
                                {t('notConfigured')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('configureHint')}
                            </p>
                        </div>
                        <Button 
                            onClick={handleGoToSettings} 
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            {t('goToSettings')}
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
                {/* Left Panel: Input */}
                <Card className="flex-1 overflow-y-auto flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                                <Label>{t('sourceLangLabel')}</Label>
                                <Select value={sourceLang} onValueChange={setSourceLang} disabled={!isConfigured}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="zh">{t('zh')}</SelectItem>
                                        <SelectItem value="en">{t('en')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <Button variant="ghost" size="icon" className="mb-0.5" onClick={handleSwap} disabled={!isConfigured}>
                                <ArrowRightLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex-1 space-y-2">
                                <Label>{t('targetLangLabel')}</Label>
                                <Select value={targetLang} onValueChange={setTargetLang} disabled={!isConfigured}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="zh">{t('zh')}</SelectItem>
                                        <SelectItem value="en">{t('en')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('modeLabel')}</Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {translationOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-left transition ${translationMode === option.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="translation-mode"
                                            value={option.value}
                                            className="sr-only"
                                            checked={translationMode === option.value}
                                            onChange={() => setTranslationMode(option.value)}
                                        />
                                        <span
                                            aria-hidden="true"
                                            className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${translationMode === option.value ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40 bg-background'}`}
                                        >
                                            {translationMode === option.value && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-background" />
                                            )}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium">{option.label}</p>
                                            <p className="text-xs text-muted-foreground">{option.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                            <Label>{t('sourceLabel')}</Label>
                            <Textarea
                                value={sourceText}
                                onChange={(e) => setSourceText(e.target.value)}
                                className="flex-1 resize-none font-mono text-sm"
                                placeholder={t('sourcePlaceholder')}
                                disabled={!isConfigured}
                            />
                        </div>

                        <Button onClick={handleTranslate} disabled={isLoading || !isConfigured} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? t('translating') : t('translate')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Right Panel: Output */}
                <Card className="flex-1 flex flex-col border-dashed">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('targetLabel')}</CardTitle>
                    <CopyButton value={targetText} />
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-0">
                    <Textarea
                        readOnly
                        value={targetText}
                        className="h-full resize-none font-mono text-sm bg-transparent border-none shadow-none focus-visible:ring-0 p-0"
                        placeholder={t('targetPlaceholder')}
                    />
                </CardContent>
                </Card>
            </div>
        </div>
    );
}
