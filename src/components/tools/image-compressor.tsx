'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Upload, Download, Image as ImageIcon, FileImage, ArrowRight } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

export function ImageCompressor() {
    const t = useTranslations('Tools.ImageCompressor');
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [compressedFile, setCompressedFile] = useState<File | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    
    // Options
    const [maxSizeMB, setMaxSizeMB] = useState(1);
    const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1920);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setOriginalFile(event.target.files[0]);
            setCompressedFile(null);
        }
    };

    const handleCompress = async () => {
        if (!originalFile) {
            toast.error(t('errorUpload'));
            return;
        }

        setIsCompressing(true);
        try {
            const options = {
                maxSizeMB: maxSizeMB,
                maxWidthOrHeight: maxWidthOrHeight,
                useWebWorker: true
            };
            const compressed = await imageCompression(originalFile, options);
            setCompressedFile(compressed);
        } catch (error) {
            console.error(error);
            toast.error(t('errorCompression'));
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDownload = () => {
        if (!compressedFile) return;
        const url = URL.createObjectURL(compressedFile);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed-${originalFile?.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const formatSize = (size: number) => {
        return (size / 1024 / 1024).toFixed(2) + ' MB';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Configuration */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        {t('configuration')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-8">
                    <div 
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t('dragDrop')}</span>
                        </div>
                    </div>

                    {originalFile && (
                        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                            <FileImage className="h-8 w-8 text-primary" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{originalFile.name}</p>
                                <p className="text-xs text-muted-foreground">{formatSize(originalFile.size)}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>{t('qualityLabel')} (Max Size)</Label>
                                <span className="text-sm text-muted-foreground">{maxSizeMB} MB</span>
                            </div>
                            <Slider
                                value={[maxSizeMB]}
                                onValueChange={(vals) => setMaxSizeMB(vals[0])}
                                min={0.1}
                                max={10}
                                step={0.1}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label>{t('maxWidthLabel')}</Label>
                                <span className="text-sm text-muted-foreground">{maxWidthOrHeight}px</span>
                            </div>
                            <Slider
                                value={[maxWidthOrHeight]}
                                onValueChange={(vals) => setMaxWidthOrHeight(vals[0])}
                                min={100}
                                max={4000}
                                step={100}
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleCompress} 
                        disabled={!originalFile || isCompressing} 
                        className="w-full"
                    >
                        {isCompressing ? t('compressing') : t('compress')}
                    </Button>
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('result')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 flex flex-col items-center justify-center gap-8">
                    {compressedFile ? (
                        <>
                            <div className="w-full flex items-center justify-center gap-8">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">{t('originalSize')}</p>
                                    <p className="text-xl font-bold">{formatSize(originalFile!.size)}</p>
                                </div>
                                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-1">{t('compressedSize')}</p>
                                    <p className="text-xl font-bold text-green-600">{formatSize(compressedFile.size)}</p>
                                </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground bg-green-500/10 text-green-600 px-3 py-1 rounded-full">
                                {t('compressionRatio')}: {((1 - compressedFile.size / originalFile!.size) * 100).toFixed(1)}%
                            </div>

                            <div className="relative max-w-full max-h-[300px] overflow-hidden rounded-lg border">
                                <img 
                                    src={URL.createObjectURL(compressedFile)} 
                                    alt="Compressed preview" 
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            <Button onClick={handleDownload} className="w-full max-w-xs">
                                <Download className="mr-2 h-4 w-4" />
                                {t('download')}
                            </Button>
                        </>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <FileImage className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>{originalFile ? t('readyToCompress') : t('uploadPrompt')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
