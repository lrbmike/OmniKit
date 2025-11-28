'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/ui/copy-button';
import { Binary, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

export function Base64Encoder() {
    const t = useTranslations('Tools.Base64Encoder');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        processText();
    }, [input, mode]);

    const processText = () => {
        setError(null);
        if (!input) {
            setOutput('');
            return;
        }

        try {
            if (mode === 'encode') {
                const utf8Words = CryptoJS.enc.Utf8.parse(input);
                const base64 = CryptoJS.enc.Base64.stringify(utf8Words);
                setOutput(base64);
            } else {
                const words = CryptoJS.enc.Base64.parse(input);
                const utf8String = words.toString(CryptoJS.enc.Utf8);
                if (!utf8String && input) throw new Error('Invalid Base64');
                setOutput(utf8String);
            }
        } catch (e) {
            setError(t('errorDecode'));
            setOutput('');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Panel: Configuration & Input */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Binary className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                    <div className="space-y-2">
                        <Label>{t('mode')}</Label>
                        <Select value={mode} onValueChange={(v: 'encode' | 'decode') => setMode(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="encode">{t('encode')}</SelectItem>
                                <SelectItem value="decode">{t('decode')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>{t('inputLabel')}</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInput('')}
                                disabled={!input}
                                className="h-8"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {t('clear')}
                            </Button>
                        </div>
                        <textarea
                            className="flex-1 w-full p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder={mode === 'encode' ? "Hello World" : "SGVsbG8gV29ybGQ="}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
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
                        className={`w-full h-full p-6 font-mono text-sm bg-transparent border-0 resize-none focus:ring-0 focus:outline-none ${
                            error ? 'text-red-500' : ''
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
