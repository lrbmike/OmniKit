'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslations } from 'next-intl';
import { Upload, Download, Image as ImageIcon, FileImage, Trash2 } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';
import { toast } from 'sonner';

export function ImageToBase64() {
    const t = useTranslations('Tools.ImageToBase64');
    const [mode, setMode] = useState<'image-to-base64' | 'base64-to-image'>('image-to-base64');
    
    // Image to Base64 state
    const [file, setFile] = useState<File | null>(null);
    const [base64Output, setBase64Output] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Base64 to Image state
    const [base64Input, setBase64Input] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            convertToBase64(selectedFile);
        }
    };

    const convertToBase64 = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            setBase64Output(reader.result as string);
        };
        reader.onerror = () => {
            toast.error('Error reading file');
        };
        reader.readAsDataURL(file);
    };

    const handleDownloadText = () => {
        if (!base64Output) return;
        const blob = new Blob([base64Output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file?.name || 'image'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Base64 to Image logic
    useEffect(() => {
        if (mode === 'base64-to-image' && base64Input) {
            // Simple validation/cleanup
            let src = base64Input.trim();
            if (!src.startsWith('data:image/')) {
                // If it doesn't start with data URI scheme, assume it's raw base64. 
                // We try to guess type or just assume png if we can't tell, 
                // but really browsers need the scheme for img src.
                // Let's try to append scheme if missing, default to png for now
                src = `data:image/png;base64,${src}`;
            }
            setPreviewUrl(src);
        } else {
            setPreviewUrl('');
        }
    }, [base64Input, mode]);

    const handleDownloadImage = () => {
        if (!previewUrl) return;
        const link = document.createElement('a');
        link.href = previewUrl;
        // Try to guess extension from header
        let ext = 'png';
        const match = previewUrl.match(/^data:image\/(\w+);base64,/);
        if (match) {
            ext = match[1];
        }
        link.download = `downloaded-image.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Input */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Input
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                        <Label>{t('mode')}</Label>
                        <Select 
                            value={mode} 
                            onValueChange={(v: 'image-to-base64' | 'base64-to-image') => setMode(v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image-to-base64">{t('imageToBase64')}</SelectItem>
                                <SelectItem value="base64-to-image">{t('base64ToImage')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {mode === 'image-to-base64' ? (
                        <>
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

                            {file && (
                                <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                                    <FileImage className="h-8 w-8 text-primary" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>{t('inputLabel')}</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setBase64Input('')}
                                    disabled={!base64Input}
                                    className="h-8"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear
                                </Button>
                            </div>
                            <textarea
                                className="flex-1 w-full p-4 font-mono text-xs bg-muted/20 border rounded-md resize-none focus:ring-2 focus:ring-primary focus:outline-none break-all"
                                value={base64Input}
                                onChange={(e) => setBase64Input(e.target.value)}
                                placeholder="Paste Base64 string here..."
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Right Panel: Result */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {mode === 'image-to-base64' ? t('outputLabel') : t('previewLabel')}
                    </CardTitle>
                    <div className="flex gap-2">
                        {mode === 'image-to-base64' ? (
                            <>
                                <CopyButton 
                                    value={base64Output} 
                                    disabled={!base64Output}
                                    onCopy={() => toast.success(t('copied'))}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleDownloadText}
                                    disabled={!base64Output}
                                    title={t('download')}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadImage}
                                disabled={!previewUrl}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {t('downloadImage')}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 relative">
                    {mode === 'image-to-base64' ? (
                        <textarea
                            className="w-full h-full p-6 font-mono text-xs bg-transparent border-0 resize-none focus:ring-0 focus:outline-none break-all"
                            readOnly
                            value={base64Output}
                            placeholder="Base64 string will appear here..."
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/5 p-4">
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="max-w-full max-h-full object-contain"
                                    onError={() => toast.error(t('errorInvalid'))}
                                />
                            ) : (
                                <div className="text-muted-foreground text-sm">
                                    Image preview will appear here
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
