'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Image as ImageIcon, Upload, Download, FileImage, ArrowRight, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getActiveTinyPngAccounts, type TinyPngAccount } from '@/actions/tiny-png';

export function TinyPngCompressor() {
  const t = useTranslations('Tools.TinyPngCompressor');
  const [accounts, setAccounts] = useState<TinyPngAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // 调整大小选项（可选）
  const [enableResize, setEnableResize] = useState(false);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [resizeMode, setResizeMode] = useState<'scale' | 'fit' | 'cover'>('scale');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const result = await getActiveTinyPngAccounts();
    if (result.success && result.data) {
      setAccounts(result.data);
      setIsConfigured(result.data.length > 0);

      // Auto-select the first account if available
      if (result.data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(result.data[0].id);
      }
    } else {
      setIsConfigured(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setOriginalFile(event.target.files[0]);
      setCompressedFile(null);
    }
  };

  const handleCompress = async () => {
    if (!selectedAccountId) {
      toast.error(t('pleaseSelectAccount'));
      return;
    }

    if (!originalFile) {
      toast.error(t('pleaseSelectFile'));
      return;
    }

    const account = accounts.find(acc => acc.id === selectedAccountId);
    if (!account) {
      toast.error('Account not found');
      return;
    }

    setIsCompressing(true);
    try {
      const formData = new FormData();
      formData.append('image', originalFile);
      formData.append('apiKey', account.apiKey);

      // 添加调整大小选项（如果启用）
      if (enableResize) {
        formData.append('resize', JSON.stringify({
          width,
          height,
          method: resizeMode
        }));
      }

      const response = await fetch('/api/tiny-png/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.error || 'Compression failed');
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // API返回的是二进制图像数据
      const blob = await response.blob();
      const compressedFile = new File([blob], originalFile.name, { type: blob.type });
      setCompressedFile(compressedFile);
      toast.success(t('compressionSuccess'));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('errorCompression'));
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

  if (isConfigured === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isConfigured === false) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-destructive">
              {t('accountNotConfigured')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('accountNotConfiguredDesc')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/settings/tiny-png-accounts'}>
            <Settings className="mr-2 h-4 w-4" />
            {t('goToSettings')}
          </Button>
        </div>
      </div>
    );
  }

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
        <CardContent className="flex-1 flex flex-col space-y-6">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label>{t('selectAccount')}</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectAccount')} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('accountDescription')}</p>
          </div>

          {/* File Upload */}
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
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

          {/* Resize Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-resize"
                checked={enableResize}
                onChange={(e) => setEnableResize(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="enable-resize">{t('resize')}</Label>
            </div>

            {enableResize && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('width')}</Label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md"
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('height')}</Label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md"
                      min={1}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('resizeMode')}</Label>
                  <Select value={resizeMode} onValueChange={(v) => setResizeMode(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scale">{t('scale')}</SelectItem>
                      <SelectItem value="fit">{t('fit')}</SelectItem>
                      <SelectItem value="cover">{t('cover')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleCompress}
            disabled={!selectedAccountId || !originalFile || isCompressing}
            className="w-full mt-auto"
          >
            {isCompressing ? t('compressing') : t('compress')}
          </Button>
        </CardContent>
      </Card>

      {/* Right Panel: Result */}
      <Card className="flex-1 flex flex-col border-dashed overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('results')}
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
                {t('savedAmount')}: {(((originalFile!.size - compressedFile.size) / originalFile!.size) * 100).toFixed(1)}%
              </div>

              <div className="relative max-w-full max-h-[300px] overflow-hidden rounded-lg border">
                <img
                  src={URL.createObjectURL(compressedFile)}
                  alt="Compressed preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDownload} className="max-w-xs">
                  <Download className="mr-2 h-4 w-4" />
                  {t('download')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOriginalFile(null);
                    setCompressedFile(null);
                  }}
                  className="max-w-xs"
                >
                  {t('compressAnother')}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>{originalFile ? t('readyToCompress') : t('noResult')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}