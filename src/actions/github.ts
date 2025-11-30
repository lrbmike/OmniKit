'use server';

import { db } from '@/lib/db';

export async function getGithubConfig() {
    try {
        const config = await db.systemConfig.findFirst();
        
        if (!config) {
            return { success: false, error: 'Configuration not found' };
        }

        return {
            success: true,
            data: {
                githubToken: config.githubToken || '',
            }
        };
    } catch (error) {
        console.error('Get GitHub config error:', error);
        return { success: false, error: 'Failed to get configuration' };
    }
}

export async function updateGithubConfig(data: { githubToken: string }) {
    try {
        const config = await db.systemConfig.findFirst();
        
        if (!config) {
            // 如果配置不存在，创建一个新的
            await db.systemConfig.create({
                data: {
                    githubToken: data.githubToken,
                }
            });
        } else {
            // 如果配置存在，更新它
            await db.systemConfig.update({
                where: { id: config.id },
                data: {
                    githubToken: data.githubToken,
                }
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Update GitHub config error:', error);
        return { success: false, error: 'Failed to update configuration' };
    }
}

export async function uploadToGithub(data: {
    owner: string;
    repo: string;
    path: string;
    fileName: string;
    content: string; // base64
}) {
    try {
        const config = await db.systemConfig.findFirst();
        
        if (!config || !config.githubToken) {
            return { success: false, error: 'GitHub token not configured' };
        }

        const { owner, repo, path, fileName, content } = data;
        const timestamp = new Date().getTime();
        const fileNameWithTimestamp = `${timestamp}-${fileName}`;
        const filePath = path ? `${path}/${fileNameWithTimestamp}` : fileNameWithTimestamp;

        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${config.githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Upload ${fileNameWithTimestamp}`,
                    content: content,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return { 
                success: false, 
                error: `Upload failed: ${errorData.message}` 
            };
        }

        const result = await response.json();
        const rawUrl = result.content.download_url;
        
        // Generate CDN URL
        let cdnUrl = '';
        const parts = rawUrl.split('/');
        if (parts.length >= 6) {
            const cdnOwner = parts[3];
            const cdnRepo = parts[4];
            const cdnPath = parts.slice(6).join('/');
            cdnUrl = `https://cdn.jsdelivr.net/gh/${cdnOwner}/${cdnRepo}/${cdnPath}`;
        } else {
            cdnUrl = rawUrl.replace(
                'https://raw.githubusercontent.com',
                'https://cdn.jsdelivr.net/gh'
            );
        }

        return {
            success: true,
            data: {
                rawUrl,
                cdnUrl,
                fileName: fileNameWithTimestamp,
            }
        };
    } catch (error: any) {
        console.error('Upload to GitHub error:', error);
        return { 
            success: false, 
            error: `Unexpected error: ${error.message}` 
        };
    }
}
