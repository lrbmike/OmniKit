'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslations } from 'next-intl';
import { Droplet, Copy } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';
import { toast } from 'sonner';

export function GradientGenerator() {
    const t = useTranslations('Tools.GradientGenerator');
    const [type, setType] = useState<'linear' | 'radial'>('linear');
    const [direction, setDirection] = useState(135);
    const [color1, setColor1] = useState('#3b82f6');
    const [color2, setColor2] = useState('#ef4444');
    const [css, setCss] = useState('');

    useEffect(() => {
        generateCss();
    }, [type, direction, color1, color2]);

    const generateCss = () => {
        let gradient = '';
        if (type === 'linear') {
            gradient = `linear-gradient(${direction}deg, ${color1}, ${color2})`;
        } else {
            gradient = `radial-gradient(circle, ${color1}, ${color2})`;
        }
        setCss(`background: ${gradient};`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Droplet className="h-5 w-5" />
                        Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                        <Label>{t('type')}</Label>
                        <Select value={type} onValueChange={(v: 'linear' | 'radial') => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="linear">{t('linear')}</SelectItem>
                                <SelectItem value="radial">{t('radial')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 'linear' && (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>{t('direction')}</Label>
                                <span className="text-sm text-muted-foreground">{direction}°</span>
                            </div>
                            <Slider
                                value={[direction]}
                                onValueChange={(vals) => setDirection(vals[0])}
                                min={0}
                                max={360}
                                step={1}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label>{t('colors')}</Label>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <Input
                                    type="color"
                                    value={color1}
                                    onChange={(e) => setColor1(e.target.value)}
                                    className="h-12 p-1 cursor-pointer"
                                />
                                <Input 
                                    value={color1} 
                                    onChange={(e) => setColor1(e.target.value)}
                                    className="font-mono text-xs text-center"
                                    maxLength={7}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input
                                    type="color"
                                    value={color2}
                                    onChange={(e) => setColor2(e.target.value)}
                                    className="h-12 p-1 cursor-pointer"
                                />
                                <Input 
                                    value={color2} 
                                    onChange={(e) => setColor2(e.target.value)}
                                    className="font-mono text-xs text-center"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Preview & CSS */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Preview
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 flex flex-col space-y-6">
                    <div 
                        className="flex-1 w-full rounded-lg shadow-inner border"
                        style={{ background: css.replace('background: ', '').replace(';', '') }}
                    />
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>{t('cssLabel')}</Label>
                            <CopyButton value={css} />
                        </div>
                        <div className="relative">
                            <textarea
                                className="w-full h-24 p-4 font-mono text-sm bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                                readOnly
                                value={css}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
