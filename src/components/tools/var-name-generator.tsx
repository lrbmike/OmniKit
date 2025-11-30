'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Copy, Check } from 'lucide-react';
import { generateVarNames } from '@/actions/var-name-gen';

interface GeneratedResult {
    normal: {
        url: string;
        var_name: string;
        file_name: string;
        route: string;
    };
    short: {
        url: string;
        var_name: string;
        file_name: string;
        route: string;
    };
}

export default function VarNameGenerator() {
    const t = useTranslations('Tools.VarNameGenerator');
    const [input, setInput] = useState('');
    const [result, setResult] = useState<GeneratedResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!input.trim()) {
            toast.error(t('errorEmpty'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await generateVarNames({ text: input });

            if (response.success && response.data) {
                setResult(response.data);
                toast.success(t('generateSuccess'));
            } else {
                toast.error(response.error || t('errorGeneration'));
            }
        } catch (error) {
            console.error('Generate error:', error);
            toast.error(t('errorGeneration'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            toast.success(t('copied'));
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            toast.error(t('copyError'));
        }
    };

    const ResultField = ({ label, value, field }: { label: string; value: string; field: string }) => (
        <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="flex gap-2">
                <Input
                    value={value}
                    readOnly
                    className="flex-1 font-mono text-sm bg-muted/50"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(value, field)}
                    className="shrink-0"
                >
                    {copiedField === field ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Panel: Input */}
            <Card className="flex-1 overflow-y-auto flex flex-col lg:max-w-md">
                <CardHeader>
                    <CardTitle>{t('input')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('inputDescription')}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <Label>{t('inputLabel')}</Label>
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 resize-none"
                            placeholder={t('inputPlaceholder')}
                        />
                    </div>

                    <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? t('generating') : t('generate')}
                    </Button>
                </CardContent>
            </Card>

            {/* Right Panel: Results */}
            <Card className="flex-1 flex flex-col border-dashed">
                <CardHeader>
                    <CardTitle>{t('normalVersion')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t('normalDescription')}</p>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    {!result ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground text-sm">{t('emptyState')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Normal Version */}
                            <div className="space-y-4">
                                <ResultField
                                    label={t('url')}
                                    value={result.normal.url}
                                    field="normal-url"
                                />
                                <ResultField
                                    label={t('varName')}
                                    value={result.normal.var_name}
                                    field="normal-var"
                                />
                                <ResultField
                                    label={t('fileName')}
                                    value={result.normal.file_name}
                                    field="normal-file"
                                />
                                <ResultField
                                    label={t('route')}
                                    value={result.normal.route}
                                    field="normal-route"
                                />
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        {t('shortVersion')}
                                    </span>
                                </div>
                            </div>

                            {/* Short Version */}
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">{t('shortDescription')}</p>
                                <ResultField
                                    label={t('url')}
                                    value={result.short.url}
                                    field="short-url"
                                />
                                <ResultField
                                    label={t('varName')}
                                    value={result.short.var_name}
                                    field="short-var"
                                />
                                <ResultField
                                    label={t('fileName')}
                                    value={result.short.file_name}
                                    field="short-file"
                                />
                                <ResultField
                                    label={t('route')}
                                    value={result.short.route}
                                    field="short-route"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
