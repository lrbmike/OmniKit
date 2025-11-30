'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadToGithub } from '@/actions/github';
import { getSystemConfig } from '@/actions/system';
import { toast } from 'sonner';
import { Upload, Copy, ExternalLink, AlertCircle, Settings } from 'lucide-react';

export function GithubUploader() {
    const t = useTranslations('Tools.GithubUploader');
    const router = useRouter();
    const pathname = usePathname();
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');
    const [path, setPath] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [hasGithubToken, setHasGithubToken] = useState<boolean | null>(null);
    const [uploadResult, setUploadResult] = useState<{
        rawUrl: string;
        cdnUrl: string;
        fileName: string;
    } | null>(null);

    // 检查是否配置了 GitHub Token
    useEffect(() => {
        const checkGithubToken = async () => {
            try {
                const config = await getSystemConfig() as any;
                setHasGithubToken(!!config?.githubToken);
            } catch (error) {
                console.error('Failed to check GitHub token:', error);
                setHasGithubToken(false);
            }
        };
        checkGithubToken();
    }, []);

    // 从 localStorage 加载保存的配置
    useEffect(() => {
        const savedOwner = localStorage.getItem('github_owner');
        const savedRepo = localStorage.getItem('github_repo');
        const savedPath = localStorage.getItem('github_path');
        
        if (savedOwner) setOwner(savedOwner);
        if (savedRepo) setRepo(savedRepo);
        if (savedPath) setPath(savedPath);
    }, []);

    // 保存配置到 localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('github_owner', owner);
        localStorage.setItem('github_repo', repo);
        localStorage.setItem('github_path', path);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadResult(null);
        }
    };

    const handleUpload = async () => {
        if (!owner || !repo || !file) {
            toast.error(t('missingFieldsError'));
            return;
        }

        // 保存配置
        saveToLocalStorage();

        setIsUploading(true);
        setUploadResult(null);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = (reader.result as string).split(',')[1];

            try {
                const result = await uploadToGithub({
                    owner,
                    repo,
                    path,
                    fileName: file.name,
                    content: base64Content,
                });

                if (result.success && result.data) {
                    setUploadResult(result.data);
                    toast.success(t('uploadSuccess'));
                } else {
                    toast.error(result.error || t('uploadFailed'));
                }
            } catch (error: any) {
                toast.error(`${t('unexpectedError')}: ${error.message}`);
            } finally {
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            toast.error(t('fileReadError'));
            setIsUploading(false);
        };
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} ${t('copied')}`);
    };

    const handleGoToSettings = () => {
        const locale = pathname.split('/')[1] || 'zh';
        router.push(`/${locale}/admin/settings/github`);
    };

    return (
        <div className="space-y-6">
            {/* 配置提示条 */}
            {hasGithubToken === false && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium text-destructive">
                                {t('tokenNotConfigured')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('tokenNotConfiguredDesc')}
                            </p>
                        </div>
                        <Button 
                            onClick={handleGoToSettings} 
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            {t('goToSettings')}
                        </Button>
                    </div>
                </div>
            )}

            {/* 主要内容 */}
            <div className="grid gap-6 md:grid-cols-2">
            {/* 左侧：配置和上传 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('configuration')}</CardTitle>
                    <CardDescription>{t('configDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="owner">{t('owner')}</Label>
                        <Input
                            id="owner"
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            placeholder={t('ownerPlaceholder')}
                            disabled={hasGithubToken === false}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="repo">{t('repo')}</Label>
                        <Input
                            id="repo"
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            placeholder={t('repoPlaceholder')}
                            disabled={hasGithubToken === false}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="path">{t('path')}</Label>
                        <Input
                            id="path"
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            placeholder={t('pathPlaceholder')}
                            disabled={hasGithubToken === false}
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('pathHint')}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">{t('file')}</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={handleFileChange}
                            disabled={hasGithubToken === false}
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                {t('selectedFile')}: {file.name}
                            </p>
                        )}
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || !file || !owner || !repo || hasGithubToken === false}
                        className="w-full"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? t('uploading') : t('upload')}
                    </Button>
                </CardContent>
            </Card>

            {/* 右侧：上传结果 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('result')}</CardTitle>
                    <CardDescription>{t('resultDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {uploadResult ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('fileName')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={uploadResult.fileName}
                                        readOnly
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('cdnUrl')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={uploadResult.cdnUrl}
                                        readOnly
                                        className="flex-1"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => copyToClipboard(uploadResult.cdnUrl, t('cdnUrl'))}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => window.open(uploadResult.cdnUrl, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('rawUrl')}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={uploadResult.rawUrl}
                                        readOnly
                                        className="flex-1"
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => copyToClipboard(uploadResult.rawUrl, t('rawUrl'))}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => window.open(uploadResult.rawUrl, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            <p>{t('noResult')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </div>
    );
}
