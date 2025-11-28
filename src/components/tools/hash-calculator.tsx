'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/ui/copy-button';
import { Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

export function HashCalculator() {
    const t = useTranslations('Tools.HashCalculator');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [algo, setAlgo] = useState('MD5');
    const [uppercase, setUppercase] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(true);

    useEffect(() => {
        if (autoUpdate) {
            calculateHash();
        }
    }, [input, algo, uppercase, autoUpdate]);

    const calculateHash = () => {
        if (!input) {
            setOutput('');
            return;
        }

        let hash: CryptoJS.lib.WordArray;

        switch (algo) {
            case 'MD5':
                hash = CryptoJS.MD5(input);
                break;
            case 'SHA1':
                hash = CryptoJS.SHA1(input);
                break;
            case 'SHA256':
                hash = CryptoJS.SHA256(input);
                break;
            case 'SHA512':
                hash = CryptoJS.SHA512(input);
                break;
            case 'SHA3':
                hash = CryptoJS.SHA3(input);
                break;
            case 'RIPEMD160':
                hash = CryptoJS.RIPEMD160(input);
                break;
            default:
                hash = CryptoJS.MD5(input);
        }

        let result = hash.toString();
        if (uppercase) {
            result = result.toUpperCase();
        }
        setOutput(result);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                        <Label>{t('algorithm')}</Label>
                        <Select value={algo} onValueChange={setAlgo}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MD5">MD5</SelectItem>
                                <SelectItem value="SHA1">SHA1</SelectItem>
                                <SelectItem value="SHA256">SHA256</SelectItem>
                                <SelectItem value="SHA512">SHA512</SelectItem>
                                <SelectItem value="SHA3">SHA3</SelectItem>
                                <SelectItem value="RIPEMD160">RIPEMD160</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md bg-muted/30">
                        <Label htmlFor="uppercase" className="cursor-pointer flex-1">
                            {t('uppercase')}
                        </Label>
                        <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md bg-muted/30">
                        <Label htmlFor="auto-update" className="cursor-pointer flex-1">
                            {t('autoUpdate')}
                        </Label>
                        <Switch id="auto-update" checked={autoUpdate} onCheckedChange={setAutoUpdate} />
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <Label>{t('inputLabel')}</Label>
                        <textarea
                            className="flex-1 w-full p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="Enter text to hash..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    {!autoUpdate && (
                        <Button onClick={calculateHash} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t('calculate')}
                        </Button>
                    )}
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
                <CardContent className="flex-1 p-0">
                    <textarea
                        className="w-full h-full p-6 font-mono text-sm bg-transparent border-0 resize-none focus:ring-0 focus:outline-none"
                        readOnly
                        value={output}
                        placeholder={t('outputLabel')}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
