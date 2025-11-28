'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { FileText, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';

export function MarkdownPreview() {
    const t = useTranslations('Tools.MarkdownPreview');
    const [input, setInput] = useState(t('sample'));

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Input */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Editor
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-2">
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
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="# Markdown here..."
                    />
                </CardContent>
            </Card>

            {/* Right Panel: Preview */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('previewLabel')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 overflow-auto prose prose-sm dark:prose-invert max-w-none">
                    <Markdown>{input}</Markdown>
                </CardContent>
            </Card>
        </div>
    );
}
