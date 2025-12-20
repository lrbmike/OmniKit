'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { CopyButton } from '@/components/ui/copy-button';
import { Camera, Clipboard, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsQR from 'jsqr';

export function QRScanner() {
    const t = useTranslations('Tools.QRScanner');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [decodedText, setDecodedText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // 处理文件上传
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImageFile(file);
        }
    };

    // 从剪贴板读取图片
    const handlePasteFromClipboard = async () => {
        try {
            setError(null);
            setIsProcessing(true);

            // 检查浏览器是否支持 Clipboard API
            if (!navigator.clipboard || !('read' in navigator.clipboard)) {
                throw new Error(t('clipboardNotSupported'));
            }

            const clipboardItems = await navigator.clipboard.read();
            let foundImage = false;

            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        const file = new File([blob], 'clipboard-image.png', { type });
                        processImageFile(file);
                        foundImage = true;
                        toast.success(t('clipboardSuccess'));
                        break;
                    }
                }
                if (foundImage) break;
            }

            if (!foundImage) {
                setError(t('noImageInClipboard'));
            }
        } catch (err) {
            console.error('Failed to read from clipboard:', err);
            setError(t('clipboardError'));
        } finally {
            setIsProcessing(false);
        }
    };

    // 处理图片文件
    const processImageFile = (file: File) => {
        setError(null);

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            setError(t('invalidImageType'));
            return;
        }

        // 验证文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
            setError(t('fileTooLarge'));
            return;
        }

        setImageFile(file);

        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target?.result as string;
            setImagePreview(imageData);

            // 解码二维码
            decodeQRCode(imageData);
        };
        reader.readAsDataURL(file);
    };

    // 解码二维码
    const decodeQRCode = (imageDataUrl: string) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) {
                    setError(t('decodeError'));
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    setDecodedText(code.data);
                    toast.success(t('decodeSuccess'));
                } else {
                    setError(t('noQrCodeFound'));
                    setDecodedText('');
                }
            } catch (err) {
                console.error('QR decode error:', err);
                setError(t('decodeError'));
                setDecodedText('');
            }
        };
        img.onerror = () => {
            setError(t('imageLoadError'));
            setDecodedText('');
        };
        img.src = imageDataUrl;
    };

    // 清除所有输入
    const handleClear = () => {
        setImageFile(null);
        setImagePreview('');
        setDecodedText('');
        setError(null);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
            {/* 左侧面板：配置 & 输入 */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardContent className="flex-1 flex flex-col space-y-6 p-6">
                    {/* 图片预览区域 */}
                    <div className="space-y-2">
                        <Label>{t('previewLabel')}</Label>
                        <div className="border-2 border-dashed border-input rounded-lg p-4 min-h-[150px] flex items-center justify-center">
                            {imagePreview ? (
                                <div className="flex flex-col items-center space-y-4">
                                    <img
                                        src={imagePreview}
                                        alt="QR Code Preview"
                                        className="max-w-full max-h-[200px] object-contain rounded"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        {imageFile?.name} ({(imageFile?.size || 0) / 1024} KB)
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center space-y-2">
                                    <Camera className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                                    <p className="text-sm text-muted-foreground">
                                        {t('noImagePlaceholder')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* 文件上传按钮 */}
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="sr-only"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-full py-8 flex flex-col items-center justify-center gap-2"
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <Upload className="h-6 w-6" />
                                <div className="text-center">
                                    <div className="font-medium">{t('uploadButton')}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {t('uploadFileHint')}
                                    </div>
                                </div>
                            </Button>
                        </div>

                        {/* 剪贴板粘贴按钮 */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-full py-8 flex flex-col items-center justify-center gap-2"
                            onClick={handlePasteFromClipboard}
                            disabled={isProcessing}
                        >
                            <Clipboard className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-medium">{t('pasteButton')}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {t('pasteFromClipboardHint')}
                                </div>
                            </div>
                        </Button>
                    </div>

                    {/* 清除按钮 */}
                    <Button
                        variant="secondary"
                        onClick={handleClear}
                        disabled={!imageFile}
                        className="w-full"
                    >
                        {t('clearButton')}
                    </Button>
                </CardContent>
            </Card>

            {/* 右侧面板：结果 */}
            <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        输出
                    </CardTitle>
                    <CopyButton
                        value={decodedText}
                        disabled={!decodedText || decodedText === t('decodedTextPlaceholder')}
                        onCopy={() => toast.success(t('copied'))}
                    />
                </CardHeader>
                <CardContent className="flex-1 p-0 relative">
                    <textarea
                        className="w-full h-full p-6 font-mono text-sm bg-transparent border-0 resize-none focus:ring-0 focus:outline-none"
                        readOnly
                        placeholder={t('resultPlaceholder')}
                        value={decodedText || error || ''}
                    />
                </CardContent>
            </Card>
        </div>
    );
}