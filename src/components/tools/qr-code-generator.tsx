'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
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
import { toast } from 'sonner';
import { Download, RefreshCw, Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function QrCodeGenerator() {
    const t = useTranslations('Tools.QrCodeGenerator');
    const [text, setText] = useState('https://example.com');
    const [size, setSize] = useState(256);
    const [margin, setMargin] = useState(4);
    const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#ffffff');
    const [dataUrl, setDataUrl] = useState('');

    useEffect(() => {
        generateQrCode();
    }, [text, size, margin, errorCorrection, colorDark, colorLight]);

    const generateQrCode = async () => {
        try {
            if (!text) {
                setDataUrl('');
                return;
            }

            const url = await QRCode.toDataURL(text, {
                width: size,
                margin: margin,
                color: {
                    dark: colorDark,
                    light: colorLight,
                },
                errorCorrectionLevel: errorCorrection,
            });
            setDataUrl(url);
        } catch (err) {
            console.error(err);
        }
    };

    const downloadQrCode = () => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t('downloadSuccess'));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        {t('configuration')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="text">{t('contentLabel')}</Label>
                        <Input
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('contentPlaceholder')}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>{t('size')}</Label>
                            <span className="text-sm text-muted-foreground">{size}px</span>
                        </div>
                        <Slider
                            value={[size]}
                            onValueChange={(vals) => setSize(vals[0])}
                            min={128}
                            max={1024}
                            step={32}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>{t('margin')}</Label>
                            <span className="text-sm text-muted-foreground">{margin}</span>
                        </div>
                        <Slider
                            value={[margin]}
                            onValueChange={(vals) => setMargin(vals[0])}
                            min={0}
                            max={10}
                            step={1}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('errorCorrection')}</Label>
                        <Select
                            value={errorCorrection}
                            onValueChange={(val: 'L' | 'M' | 'Q' | 'H') => setErrorCorrection(val)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="L">Low (7%)</SelectItem>
                                <SelectItem value="M">Medium (15%)</SelectItem>
                                <SelectItem value="Q">Quartile (25%)</SelectItem>
                                <SelectItem value="H">High (30%)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('foreground')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={colorDark}
                                    onChange={(e) => setColorDark(e.target.value)}
                                    className="w-12 h-10 p-1 px-1"
                                />
                                <Input
                                    value={colorDark}
                                    onChange={(e) => setColorDark(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('background')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={colorLight}
                                    onChange={(e) => setColorLight(e.target.value)}
                                    className="w-12 h-10 p-1 px-1"
                                />
                                <Input
                                    value={colorLight}
                                    onChange={(e) => setColorLight(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Right Panel: Preview */}
            <Card className="flex-1 flex flex-col justify-center items-center p-8 border-dashed">
                <div className="flex flex-col items-center gap-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        {dataUrl ? (
                            <img src={dataUrl} alt="QR Code" className="max-w-full h-auto" style={{ maxHeight: '400px' }} />
                        ) : (
                            <div className="w-64 h-64 flex flex-col items-center justify-center text-gray-400">
                                <RefreshCw className="h-8 w-8 mb-2 opacity-50" />
                                <span>{t('enterText')}</span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={downloadQrCode}
                        disabled={!dataUrl}
                        size="lg"
                        className="w-full max-w-xs"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {t('download')}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
