'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Minimize2, AlignLeft, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';

export function JsonFormatter() {
    const t = useTranslations('Tools.JsonFormatter');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const formatJson = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError(null);
            toast.success(t('successFormat'));
        } catch (e) {
            setError((e as Error).message);
            toast.error(t('invalidJson'));
        }
    };

    const minifyJson = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
            toast.success(t('successMinify'));
        } catch (e) {
            setError((e as Error).message);
            toast.error(t('invalidJson'));
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Input */}
            <Card className="flex-1 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('inputLabel')}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setInput('')} disabled={!input}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('clear')}
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <textarea
                        className="w-full h-full p-4 font-mono text-sm bg-transparent border-0 resize-none focus:ring-0 focus:outline-none"
                        placeholder={t('inputLabel')}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </CardContent>
            </Card>

            {/* Middle: Actions (Desktop) / Top (Mobile) */}
            <div className="flex lg:flex-col justify-center gap-2">
                <Button onClick={formatJson} title={t('format')}>
                    <AlignLeft className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">{t('format')}</span>
                </Button>
                <Button onClick={minifyJson} title={t('minify')} variant="secondary">
                    <Minimize2 className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">{t('minify')}</span>
                </Button>
            </div>

            {/* Right Panel: Output */}
            <Card className="flex-1 flex flex-col bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('outputLabel')}
                    </CardTitle>
                    <CopyButton
                        value={output}
                        disabled={!output}
                        onCopy={() => toast.success(t('copied'))}
                    />
                </CardHeader>
                <CardContent className="flex-1 p-0 relative">
                    <textarea
                        className={`w-full h-full p-4 font-mono text-sm bg-transparent border-0 resize-none focus:ring-0 focus:outline-none ${error ? 'text-red-500' : ''
                            }`}
                        readOnly
                        value={error || output}
                        placeholder={t('outputLabel')}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
