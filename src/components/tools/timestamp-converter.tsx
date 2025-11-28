'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Clock, RefreshCw } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';
import { format, fromUnixTime, getUnixTime, isValid, parseISO } from 'date-fns';

export function TimestampConverter() {
    const t = useTranslations('Tools.TimestampConverter');
    const [timestamp, setTimestamp] = useState<string>('');
    const [isoDate, setIsoDate] = useState<string>('');
    const [now, setNow] = useState<Date>(new Date());
    const [dateResult, setDateResult] = useState<{ local: string, utc: string } | null>(null);
    const [tsResult, setTsResult] = useState<number | null>(null);

    // Initialize with current time
    useEffect(() => {
        handleNow();
        // Timer to update "current time" display if we wanted to show a clock, 
        // but here we just use handleNow for manual update.
    }, []);

    const handleNow = () => {
        const currentDate = new Date();
        setNow(currentDate);
        const ts = getUnixTime(currentDate);
        setTimestamp(ts.toString());
        setIsoDate(currentDate.toISOString().slice(0, 16)); // YYYY-MM-DDTHH:mm for input type="datetime-local"
        updateResults(currentDate);
    };

    const updateResults = (date: Date) => {
        if (isValid(date)) {
            setDateResult({
                local: format(date, 'yyyy-MM-dd HH:mm:ss'),
                utc: date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC')
            });
            setTsResult(getUnixTime(date));
        } else {
            setDateResult(null);
            setTsResult(null);
        }
    };

    const handleTimestampChange = (val: string) => {
        setTimestamp(val);
        const ts = parseInt(val, 10);
        if (!isNaN(ts)) {
            // Check if milliseconds (13 digits) or seconds (10 digits)
            // Generally unix timestamp is seconds, but JS uses milliseconds.
            // date-fns fromUnixTime takes seconds.
            let date: Date;
            if (val.length > 10) {
                date = new Date(ts); // Milliseconds
            } else {
                date = fromUnixTime(ts); // Seconds
            }
            
            if (isValid(date)) {
                setIsoDate(date.toISOString().slice(0, 16));
                updateResults(date);
            }
        }
    };

    const handleDateChange = (val: string) => {
        setIsoDate(val);
        if (val) {
            const date = parseISO(val);
            if (isValid(date)) {
                setTimestamp(getUnixTime(date).toString());
                updateResults(date);
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Panel: Input */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-8">
                     <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={handleNow}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t('now')}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <Label>{t('timestampLabel')} (Seconds/Milliseconds)</Label>
                        <div className="flex gap-2">
                            <Input 
                                value={timestamp} 
                                onChange={(e) => handleTimestampChange(e.target.value)} 
                                placeholder="e.g. 1672531200"
                                className="font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>{t('dateLabel')}</Label>
                        <div className="flex gap-2">
                            <Input 
                                type="datetime-local"
                                value={isoDate} 
                                onChange={(e) => handleDateChange(e.target.value)} 
                                className="font-mono"
                                step="1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Result
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 space-y-6">
                    <div className="space-y-2">
                        <Label>{t('localTime')}</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={dateResult?.local || ''} className="font-mono bg-background" />
                            <CopyButton value={dateResult?.local || ''} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('utcTime')}</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={dateResult?.utc || ''} className="font-mono bg-background" />
                            <CopyButton value={dateResult?.utc || ''} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('timestampLabel')}</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={tsResult?.toString() || ''} className="font-mono bg-background" />
                            <CopyButton value={tsResult?.toString() || ''} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
