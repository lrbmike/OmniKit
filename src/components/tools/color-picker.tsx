'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/ui/copy-button';
import { Palette, Copy } from 'lucide-react';
import { toast } from 'sonner';

// Helper functions for color conversion
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function ColorPicker() {
    const t = useTranslations('Tools.ColorPicker');
    const [color, setColor] = useState('#3b82f6');
    const [rgb, setRgb] = useState('rgb(59, 130, 246)');
    const [hsl, setHsl] = useState('hsl(217, 91%, 60%)');

    useEffect(() => {
        updateColors(color);
    }, [color]);

    const updateColors = (hex: string) => {
        const rgbVal = hexToRgb(hex);
        if (rgbVal) {
            setRgb(`rgb(${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b})`);
            const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
            setHsl(`hsl(${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%)`);
        }
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setColor(val);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <Label className="text-base font-medium">{t('selectedColor')}</Label>
                        <div className="flex flex-col gap-4">
                            <div 
                                className="w-full h-32 rounded-lg border shadow-sm transition-colors"
                                style={{ backgroundColor: color }}
                            />
                            <div className="flex gap-4 items-center">
                                <Input
                                    type="color"
                                    value={color}
                                    onChange={handleHexChange}
                                    className="w-16 h-12 p-1 cursor-pointer"
                                />
                                <Input
                                    value={color}
                                    onChange={handleHexChange}
                                    className="font-mono uppercase"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 bg-muted/30 flex flex-col p-6 border-dashed">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {t('formats')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('hex')}</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={color} className="font-mono bg-background" />
                            <CopyButton value={color} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('rgb')}</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={rgb} className="font-mono bg-background" />
                            <CopyButton value={rgb} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('hsl')}</Label>
                        <div className="flex gap-2">
                            <Input readOnly value={hsl} className="font-mono bg-background" />
                            <CopyButton value={hsl} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
