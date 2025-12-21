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
import { FolderOpen, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function PathConverter() {
    const t = useTranslations('Tools.PathConverter');
    const [direction, setDirection] = useState<'win2unix' | 'unix2win'>('win2unix');
    const [inputPath, setInputPath] = useState('');
    const [convertedPath, setConvertedPath] = useState('');

    useEffect(() => {
        convertPath();
    }, [inputPath, direction]);

    const convertPath = () => {
        if (!inputPath) {
            setConvertedPath('');
            return;
        }

        let result = inputPath;

        if (direction === 'win2unix') {
            // Windows to Unix/Linux
            result = result.replace(/\\/g, '/');
            // Handle UNC paths: \\server\share -> //server/share
            result = result.replace(/^\\\\\//, '//');
            // Handle drive letters: E:\ -> E:/
            result = result.replace(/^([A-Za-z]):\//, '$1:/');
        } else {
            // Unix/Linux to Windows
            result = result.replace(/\//g, '\\');
            // Handle UNC paths: //server/share -> \\server\share
            result = result.replace(/^\/\//, '\\\\');
        }

        setConvertedPath(result);
    };

    const handleSwapDirection = () => {
        setDirection(prev => prev === 'win2unix' ? 'unix2win' : 'win2unix');
        if (convertedPath) {
            setInputPath(convertedPath);
        }
    };

    const handleClear = () => {
        setInputPath('');
        setConvertedPath('');
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Panel: Configuration */}
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>{t('configuration')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Conversion Direction */}
                    <div className="space-y-2">
                        <Label>{t('conversionDirection')}</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={direction === 'win2unix' ? 'default' : 'outline'}
                                onClick={() => setDirection('win2unix')}
                                className="flex-1"
                            >
                                Windows → Unix
                            </Button>
                            <Button
                                variant={direction === 'unix2win' ? 'default' : 'outline'}
                                onClick={() => setDirection('unix2win')}
                                className="flex-1"
                            >
                                Unix → Windows
                            </Button>
                        </div>
                    </div>

                    {/* Swap Button */}
                    <Button
                        variant="outline"
                        onClick={handleSwapDirection}
                        className="w-full"
                    >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        {t('swapDirection')}
                    </Button>

                    {/* Path Input */}
                    <div className="space-y-2">
                        <Label htmlFor="path-input">{t('inputPath')}</Label>
                        <div className="relative">
                            <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="path-input"
                                placeholder={t('pathPlaceholder')}
                                value={inputPath}
                                onChange={(e) => setInputPath(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {inputPath && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClear}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 bg-muted/30 flex flex-col relative">
                <CardHeader>
                    <CardTitle>{t('result')}</CardTitle>
                    {/* Copy Button in top-right corner */}
                    {inputPath && (
                        <div className="absolute top-6 right-6">
                            <CopyButton value={convertedPath} />
                        </div>
                    )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center">
                    {inputPath ? (
                        <div className="p-4 bg-background rounded-lg border">
                            <code className="text-sm break-all font-mono">
                                {convertedPath || t('convertedPathPlaceholder')}
                            </code>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center">
                            {t('enterPathHint')}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}