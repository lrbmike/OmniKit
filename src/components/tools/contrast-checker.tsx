'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Eye, Check, X } from 'lucide-react';

// Helper to convert hex to RGB
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Helper to calculate luminance
function getLuminance(r: number, g: number, b: number) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper to calculate contrast ratio
function getContrastRatio(hex1: string, hex2: string) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export function ContrastChecker() {
    const t = useTranslations('Tools.ContrastChecker');
    const [foreground, setForeground] = useState('#000000');
    const [background, setBackground] = useState('#ffffff');
    const [ratio, setRatio] = useState(21);

    useEffect(() => {
        const r = getContrastRatio(foreground, background);
        setRatio(parseFloat(r.toFixed(2)));
    }, [foreground, background]);

    const getStatus = (ratio: number, min: number) => {
        return ratio >= min ? (
            <div className="flex items-center text-green-600 font-bold">
                <Check className="h-4 w-4 mr-1" /> {t('pass')}
            </div>
        ) : (
            <div className="flex items-center text-red-600 font-bold">
                <X className="h-4 w-4 mr-1" /> {t('fail')}
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-8">
                    <div className="space-y-4">
                        <Label>{t('foregroundLabel')}</Label>
                        <div className="flex gap-4 items-center">
                            <Input
                                type="color"
                                value={foreground}
                                onChange={(e) => setForeground(e.target.value)}
                                className="w-16 h-12 p-1 cursor-pointer"
                            />
                            <Input
                                value={foreground}
                                onChange={(e) => setForeground(e.target.value)}
                                className="font-mono uppercase flex-1"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>{t('backgroundLabel')}</Label>
                        <div className="flex gap-4 items-center">
                            <Input
                                type="color"
                                value={background}
                                onChange={(e) => setBackground(e.target.value)}
                                className="w-16 h-12 p-1 cursor-pointer"
                            />
                            <Input
                                value={background}
                                onChange={(e) => setBackground(e.target.value)}
                                className="font-mono uppercase flex-1"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                        <div className="flex justify-between items-end">
                            <Label className="text-lg font-semibold">{t('ratioLabel')}</Label>
                            <span className={`text-4xl font-bold ${ratio < 4.5 ? 'text-red-500' : 'text-green-600'}`}>
                                {ratio}:1
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 p-4 border rounded-lg">
                            <div className="font-semibold">WCAG AA</div>
                            <div className="flex justify-between text-sm">
                                <span>Normal (4.5:1)</span>
                                {getStatus(ratio, 4.5)}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Large (3:1)</span>
                                {getStatus(ratio, 3)}
                            </div>
                        </div>
                        <div className="space-y-2 p-4 border rounded-lg">
                            <div className="font-semibold">WCAG AAA</div>
                            <div className="flex justify-between text-sm">
                                <span>Normal (7:1)</span>
                                {getStatus(ratio, 7)}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Large (4.5:1)</span>
                                {getStatus(ratio, 4.5)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Preview */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('preview')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 flex flex-col space-y-6">
                    <div 
                        className="flex-1 w-full rounded-lg shadow-inner border flex flex-col justify-center items-center p-8 gap-8 transition-colors"
                        style={{ backgroundColor: background, color: foreground }}
                    >
                        <div className="text-center space-y-2">
                            <div className="text-sm opacity-70">{t('normalText')}</div>
                            <p className="text-base">
                                {t('sampleText')}
                            </p>
                        </div>

                        <div className="text-center space-y-2">
                            <div className="text-sm opacity-70">{t('largeText')}</div>
                            <p className="text-2xl font-bold">
                                {t('sampleText')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
