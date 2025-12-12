'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface CloudinaryAccount {
  id: string;
  name: string;
  cloudName: string;
  apiKey: string | null;
  apiSecret: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCloudinaryAccountInput {
  name: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface UpdateCloudinaryAccountInput {
  id: string;
  name?: string;
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
  isActive?: boolean;
}

/**
 * 获取所有 Cloudinary 账户列表
 */
export async function getCloudinaryAccounts() {
  try {
    const accounts = await db.cloudinaryAccount.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, data: accounts };
  } catch (error) {
    console.error('获取 Cloudinary 账户列表失败:', error);
    return { success: false, error: '获取账户列表失败' };
  }
}

/**
 * 获取激活的 Cloudinary 账户列表
 */
export async function getActiveCloudinaryAccounts() {
  try {
    const accounts = await db.cloudinaryAccount.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, data: accounts };
  } catch (error) {
    console.error('获取激活的 Cloudinary 账户列表失败:', error);
    return { success: false, error: '获取账户列表失败' };
  }
}

/**
 * 根据 ID 获取 Cloudinary 账户
 */
export async function getCloudinaryAccountById(id: string) {
  try {
    const account = await db.cloudinaryAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return { success: false, error: '账户不存在' };
    }

    return { success: true, data: account };
  } catch (error) {
    console.error('获取 Cloudinary 账户失败:', error);
    return { success: false, error: '获取账户失败' };
  }
}

/**
 * 创建新的 Cloudinary 账户
 */
export async function createCloudinaryAccount(input: CreateCloudinaryAccountInput) {
  try {
    // 获取当前最大的 order 值
    const maxOrder = await db.cloudinaryAccount.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const account = await db.cloudinaryAccount.create({
      data: {
        name: input.name,
        cloudName: input.cloudName,
        apiKey: input.apiKey,
        apiSecret: input.apiSecret,
        isActive: true,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    revalidatePath('/admin/settings/cloudinary-accounts');
    return { success: true, data: account };
  } catch (error) {
    console.error('创建 Cloudinary 账户失败:', error);
    return { success: false, error: '创建账户失败' };
  }
}

/**
 * 更新 Cloudinary 账户
 */
export async function updateCloudinaryAccount(input: UpdateCloudinaryAccountInput) {
  try {
    const { id, ...data } = input;

    const account = await db.cloudinaryAccount.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/settings/cloudinary-accounts');
    return { success: true, data: account };
  } catch (error) {
    console.error('更新 Cloudinary 账户失败:', error);
    return { success: false, error: '更新账户失败' };
  }
}

/**
 * 删除 Cloudinary 账户
 */
export async function deleteCloudinaryAccount(id: string) {
  try {
    await db.cloudinaryAccount.delete({
      where: { id },
    });

    revalidatePath('/admin/settings/cloudinary-accounts');
    return { success: true };
  } catch (error) {
    console.error('删除 Cloudinary 账户失败:', error);
    return { success: false, error: '删除账户失败' };
  }
}

/**
 * 更新账户排序
 */
export async function updateCloudinaryAccountOrder(items: { id: string; order: number }[]) {
  try {
    // 批量更新排序
    await Promise.all(
      items.map((item) =>
        db.cloudinaryAccount.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    revalidatePath('/admin/settings/cloudinary-accounts');
    return { success: true };
  } catch (error) {
    console.error('更新账户排序失败:', error);
    return { success: false, error: '更新排序失败' };
  }
}