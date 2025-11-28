'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Type, Trash2 } from 'lucide-react';

export function WordCounter() {
    const t = useTranslations('Tools.WordCounter');
    const [text, setText] = useState('');

    const stats = {
        characters: text.length,
        words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
        lines: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
        paragraphs: text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).length,
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Input */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Input
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>{t('inputLabel')}</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setText('')}
                            disabled={!text}
                            className="h-8"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    </div>
                    <textarea
                        className="flex-1 w-full p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t('noText')}
                    />
                </CardContent>
            </Card>

            {/* Right Panel: Statistics */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('statsLabel')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                    {text ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/20 p-4 rounded-lg text-center border">
                                <div className="text-3xl font-bold text-primary mb-1">{stats.characters}</div>
                                <div className="text-sm text-muted-foreground">{t('characters')}</div>
                            </div>
                            <div className="bg-muted/20 p-4 rounded-lg text-center border">
                                <div className="text-3xl font-bold text-primary mb-1">{stats.words}</div>
                                <div className="text-sm text-muted-foreground">{t('words')}</div>
                            </div>
                            <div className="bg-muted/20 p-4 rounded-lg text-center border">
                                <div className="text-3xl font-bold text-primary mb-1">{stats.lines}</div>
                                <div className="text-sm text-muted-foreground">{t('lines')}</div>
                            </div>
                            <div className="bg-muted/20 p-4 rounded-lg text-center border">
                                <div className="text-3xl font-bold text-primary mb-1">{stats.paragraphs}</div>
                                <div className="text-sm text-muted-foreground">{t('paragraphs')}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <Type className="h-12 w-12 mb-4 opacity-20" />
                            <p>{t('noText')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
