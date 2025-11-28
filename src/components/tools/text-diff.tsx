'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { FileSearch } from 'lucide-react';
import { diffChars, diffWords, diffLines, Change } from 'diff';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function TextDiff() {
    const t = useTranslations('Tools.TextDiff');
    const [original, setOriginal] = useState('');
    const [modified, setModified] = useState('');
    const [diffType, setDiffType] = useState<'chars' | 'words' | 'lines'>('chars');
    const [diffs, setDiffs] = useState<Change[]>([]);

    useEffect(() => {
        let result;
        if (diffType === 'chars') {
            result = diffChars(original, modified);
        } else if (diffType === 'words') {
            result = diffWords(original, modified);
        } else {
            result = diffLines(original, modified);
        }
        setDiffs(result);
    }, [original, modified, diffType]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Inputs */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSearch className="h-5 w-5" />
                        Input
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                    <div className="space-y-2">
                        <Label>Diff Type</Label>
                        <Select value={diffType} onValueChange={(v: 'chars' | 'words' | 'lines') => setDiffType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="chars">Chars</SelectItem>
                                <SelectItem value="words">Words</SelectItem>
                                <SelectItem value="lines">Lines</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 grid grid-rows-2 gap-4">
                        <div className="flex flex-col space-y-2">
                            <Label>{t('originalLabel')}</Label>
                            <textarea
                                className="flex-1 w-full p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                                value={original}
                                onChange={(e) => setOriginal(e.target.value)}
                                placeholder="Original text..."
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label>{t('modifiedLabel')}</Label>
                            <textarea
                                className="flex-1 w-full p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                                value={modified}
                                onChange={(e) => setModified(e.target.value)}
                                placeholder="Modified text..."
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('diffLabel')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 overflow-auto font-mono text-sm whitespace-pre-wrap">
                    {diffs.length > 0 ? (
                        <div>
                            {diffs.map((part, index) => {
                                const color = part.added ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                                    part.removed ? 'bg-red-500/20 text-red-700 dark:text-red-400 decoration-through' : '';
                                return (
                                    <span key={index} className={`${color} rounded px-0.5`}>
                                        {part.value}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground mt-10">
                            {original || modified ? t('noDiff') : 'Enter text to compare'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
