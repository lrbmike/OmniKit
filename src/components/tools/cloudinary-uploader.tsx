'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card as UICard } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, Copy, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { getActiveCloudinaryAccounts } from '@/actions/cloudinary-account';
import { getCloudinaryUploadSignature } from '@/actions/cloudinary-upload';
import type { CloudinaryAccount } from '@/actions/cloudinary-account';

export function CloudinaryUploader() {
  const t = useTranslations('Tools.CloudinaryUploader');
  const router = useRouter();
  const [accounts, setAccounts] = useState<CloudinaryAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<CloudinaryAccount | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      const account = accounts.find(a => a.id === selectedAccountId);
      setSelectedAccount(account || null);
    } else {
      setSelectedAccount(null);
    }
  }, [selectedAccountId, accounts]);

  const loadAccounts = async () => {
    const result = await getActiveCloudinaryAccounts();
    if (result.success && result.data) {
      setAccounts(result.data);
      if (result.data.length > 0) {
        setSelectedAccountId(result.data[0].id);
      }
    } else {
      toast.error(result.error || 'Failed to load accounts');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !selectedAccount) {
      toast.error(t('pleaseSelectFile'));
      return;
    }

    if (!selectedAccount.apiKey || !selectedAccount.apiSecret) {
      toast.error('Account credentials are incomplete. Please check your settings.');
      return;
    }

    setUploading(true);

    try {
      // 获取上传签名
      const signatureResponse = await getCloudinaryUploadSignature(selectedAccount.id);

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureResponse.apiKey);
      formData.append('timestamp', signatureResponse.timestamp.toString());
      formData.append('signature', signatureResponse.signature);

      // 上传到 Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${selectedAccount.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (result.secure_url) {
        setUploadResult(result);
        toast.success(t('uploadSuccess'));
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t('copied'));
    });
  };

  const resetUpload = () => {
    setFile(null);
    setPreview('');
    setUploadResult(null);
  };

  if (accounts.length === 0) {
    return (
      <UICard>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">{t('accountNotConfigured')}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t('accountNotConfiguredDesc')}
              </p>
            </div>
            <Button onClick={() => router.push('/admin/settings/cloudinary-accounts')}>
              {t('goToSettings')}
            </Button>
          </div>
        </CardContent>
      </UICard>
    );
  }

  return (
    <div className="space-y-6">
      {/* 主要内容 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 左侧：配置和上传 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('selectAccount')}</CardTitle>
            <CardDescription>{t('accountDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('selectAccount')}</Label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.cloudName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAccount && (
                <p className="text-sm text-muted-foreground">
                  Using account: {selectedAccount.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('selectImage')}</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-4">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">{t('dragDrop')}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {file ? file.name : t('selectImage')}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || !selectedAccountId || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('uploading')}...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('upload')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 右侧：上传结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {t('uploadSuccess')}
                </>
              ) : (
                'Upload Results'
              )}
            </CardTitle>
            <CardDescription>{t('resultsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadResult ? (
              <div className="space-y-4">
                {/* 图片预览 */}
                <div className="space-y-2">
                  <Label>{t('viewImage')}</Label>
                  <div className="relative rounded-lg border bg-muted/50 p-4 flex items-center justify-center h-[200px]">
                    <img
                      src={uploadResult.secure_url}
                      alt={uploadResult.public_id}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>图片链接</Label>
                  <div className="flex gap-2">
                    <div className="p-2 bg-muted rounded text-xs break-all font-mono flex-1 overflow-x-auto">
                      {uploadResult.secure_url}
                    </div>
                    <CopyButton
                      value={uploadResult.secure_url}
                      variant="ghost"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(uploadResult.secure_url, '_blank')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('markdownLink')}</Label>
                  <div className="flex gap-2">
                    <div className="p-2 bg-muted rounded text-xs break-all font-mono flex-1 overflow-x-auto">
                      {`![](${uploadResult.secure_url})`}
                    </div>
                    <CopyButton
                      value={`![](${uploadResult.secure_url})`}
                      variant="ghost"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(uploadResult.secure_url, '_blank')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-start pt-8 pb-4 min-h-[300px] text-muted-foreground gap-4">
                {preview ? (
                  <>
                    <div className="relative rounded-lg border bg-muted/50 p-4 w-full max-w-md mt-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-w-full max-h-[250px] object-contain rounded mx-auto block"
                      />
                    </div>
                    <p className="text-sm">{t('readyToUpload')}</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 opacity-20 mt-8" />
                    <p>{t('noResult')}</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
