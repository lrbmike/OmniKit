'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

export function RegexTester() {
    const t = useTranslations('Tools.RegexTester');
    const [regex, setRegex] = useState('[a-z]+');
    const [flags, setFlags] = useState<string[]>(['g']);
    const [text, setText] = useState('Hello World 123 test');
    const [matches, setMatches] = useState<RegExpMatchArray | null>(null);
    const [error, setError] = useState<string | null>(null);

    const allFlags = [
        { value: 'g', label: t('flagGlobal') },
        { value: 'i', label: t('flagCaseInsensitive') },
        { value: 'm', label: t('flagMultiline') },
        { value: 's', label: t('flagDotAll') },
    ];

    const handleFlagChange = (flag: string, checked: boolean) => {
        if (checked) {
            setFlags([...flags, flag]);
        } else {
            setFlags(flags.filter((f) => f !== flag));
        }
    };

    const highlightedText = useMemo(() => {
        if (!regex || error || !text) return text;
        
        try {
            const re = new RegExp(regex, flags.join(''));
            if (!re.global) {
               // For non-global regex, simple match highlighting isn't as straightforward in React without dangerous HTML
               // So we just return text, but we could implement advanced logic later.
               // For now, let's focus on listing matches.
            }
            
            // Simple replace for highlighting is tricky with React safely.
            // We will just display match list for now.
            return text;
        } catch (e) {
            return text;
        }
    }, [regex, flags, text, error]);

    useEffect(() => {
        setError(null);
        if (!regex) {
            setMatches(null);
            return;
        }

        try {
            const re = new RegExp(regex, flags.join(''));
            const found = text.match(re);
            setMatches(found);
        } catch (e) {
            setError((e as Error).message);
            setMatches(null);
        }
    }, [regex, flags, text]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Configuration & Input */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        {t('configuration')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                        <Label>{t('regexLabel')}</Label>
                        <Input 
                            value={regex} 
                            onChange={(e) => setRegex(e.target.value)} 
                            className={`font-mono ${error ? 'border-red-500' : ''}`}
                            placeholder="[a-z]+"
                        />
                        {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('flags')}</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {allFlags.map((flag) => (
                                <div key={flag.value} className="flex items-center justify-between space-x-2 border p-2 rounded bg-muted/30">
                                    <Label htmlFor={`flag-${flag.value}`} className="font-normal cursor-pointer text-sm flex-1">
                                        {flag.label}
                                    </Label>
                                    <Switch 
                                        id={`flag-${flag.value}`} 
                                        checked={flags.includes(flag.value)}
                                        onCheckedChange={(checked) => handleFlagChange(flag.value, checked)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col space-y-2">
                        <Label>{t('textLabel')}</Label>
                        <textarea
                            className="flex-1 w-full p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('inputPlaceholder')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('resultLabel')}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                        {matches 
                            ? t('matchesFound', { count: matches.length }) 
                            : t('noMatch')}
                    </span>
                </CardHeader>
                <CardContent className="flex-1 p-6 overflow-auto">
                   {matches && matches.length > 0 ? (
                       <div className="space-y-2">
                           {Array.from(matches).map((match, index) => (
                               <div key={index} className="p-3 bg-background border rounded-md font-mono text-sm break-all">
                                   <span className="text-muted-foreground mr-2">[{index}]</span>
                                   {match}
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center text-muted-foreground mt-10">
                           {t('noMatch')}
                       </div>
                   )}
                </CardContent>
            </Card>
        </div>
    );
}
