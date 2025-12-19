'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface TinyPngAccount {
  id: string;
  name: string;
  apiKey: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTinyPngAccountInput {
  name: string;
  apiKey: string;
}

export interface UpdateTinyPngAccountInput {
  id: string;
  name?: string;
  apiKey?: string;
  isActive?: boolean;
}

/**
 * 获取所有 TinyPNG 账户列表
 */
export async function getTinyPngAccounts() {
  try {
    const accounts = await db.tinyPngAccount.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, data: accounts };
  } catch (error) {
    console.error('获取 TinyPNG 账户列表失败:', error);
    return { success: false, error: '获取账户列表失败' };
  }
}

/**
 * 获取激活的 TinyPNG 账户列表
 */
export async function getActiveTinyPngAccounts() {
  try {
    const accounts = await db.tinyPngAccount.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, data: accounts };
  } catch (error) {
    console.error('获取激活的 TinyPNG 账户列表失败:', error);
    return { success: false, error: '获取账户列表失败' };
  }
}

/**
 * 根据 ID 获取 TinyPNG 账户
 */
export async function getTinyPngAccountById(id: string) {
  try {
    const account = await db.tinyPngAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return { success: false, error: '账户不存在' };
    }

    return { success: true, data: account };
  } catch (error) {
    console.error('获取 TinyPNG 账户失败:', error);
    return { success: false, error: '获取账户失败' };
  }
}

/**
 * 创建新的 TinyPNG 账户
 */
export async function createTinyPngAccount(input: CreateTinyPngAccountInput) {
  try {
    // 获取当前最大的 order 值
    const maxOrder = await db.tinyPngAccount.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const account = await db.tinyPngAccount.create({
      data: {
        name: input.name,
        apiKey: input.apiKey,
        isActive: true,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    revalidatePath('/admin/settings/tiny-png-accounts');
    return { success: true, data: account };
  } catch (error) {
    console.error('创建 TinyPNG 账户失败:', error);
    return { success: false, error: '创建账户失败' };
  }
}

/**
 * 更新 TinyPNG 账户
 */
export async function updateTinyPngAccount(input: UpdateTinyPngAccountInput) {
  try {
    const { id, ...data } = input;

    const account = await db.tinyPngAccount.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/settings/tiny-png-accounts');
    return { success: true, data: account };
  } catch (error) {
    console.error('更新 TinyPNG 账户失败:', error);
    return { success: false, error: '更新账户失败' };
  }
}

/**
 * 删除 TinyPNG 账户
 */
export async function deleteTinyPngAccount(id: string) {
  try {
    await db.tinyPngAccount.delete({
      where: { id },
    });

    revalidatePath('/admin/settings/tiny-png-accounts');
    return { success: true };
  } catch (error) {
    console.error('删除 TinyPNG 账户失败:', error);
    return { success: false, error: '删除账户失败' };
  }
}

/**
 * 更新账户排序
 */
export async function updateTinyPngAccountOrder(items: { id: string; order: number }[]) {
  try {
    // 批量更新排序
    await Promise.all(
      items.map((item) =>
        db.tinyPngAccount.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    revalidatePath('/admin/settings/tiny-png-accounts');
    return { success: true };
  } catch (error) {
    console.error('更新账户排序失败:', error);
    return { success: false, error: '更新排序失败' };
  }
}