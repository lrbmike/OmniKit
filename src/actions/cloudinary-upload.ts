'use server';

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

/**
 * 为指定的 Cloudinary 账户生成上传签名
 */
export async function getCloudinaryUploadSignature(
  accountId: string,
  folder?: string
): Promise<UploadSignatureResponse> {
  try {
    const { db } = await import('@/lib/db');
    const { v2: cloudinary } = await import('cloudinary');

    // 获取账户信息
    const account = await db.cloudinaryAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Cloudinary account not found');
    }

    if (!account.isActive) {
      throw new Error('Cloudinary account is inactive');
    }

    // 使用 Cloudinary SDK v2 配置
    (cloudinary.config as any)({
      cloud_name: account.cloudName,
      api_key: account.apiKey || undefined,
      api_secret: account.apiSecret || undefined,
    });

    // 生成时间戳
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 准备签名参数
    const paramsToSign: Record<string, string | number> = {
      timestamp,
    };

    // 如果指定了文件夹，则添加 folder 参数
    if (folder) {
      paramsToSign.folder = folder;
    }

    // 生成签名
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      account.apiSecret!
    );

    return {
      signature,
      timestamp,
      apiKey: account.apiKey!,
      cloudName: account.cloudName,
    };
  } catch (error) {
    console.error('Error generating upload signature:', error);
    throw new Error('Failed to generate upload signature');
  }
}