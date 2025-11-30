'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface AiProvider {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string | null;
  model: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAiProviderInput {
  name: string;
  type: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface UpdateAiProviderInput {
  id: string;
  name?: string;
  type?: string;
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  isActive?: boolean;
}

/**
 * 获取所有 AI 提供商列表
 */
export async function getAiProviders() {
  try {
    const providers = await db.aiProvider.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, data: providers };
  } catch (error) {
    console.error('获取 AI 提供商列表失败:', error);
    return { success: false, error: '获取提供商列表失败' };
  }
}

/**
 * 获取激活的 AI 提供商列表
 */
export async function getActiveAiProviders() {
  try {
    const providers = await db.aiProvider.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, data: providers };
  } catch (error) {
    console.error('获取激活的 AI 提供商列表失败:', error);
    return { success: false, error: '获取提供商列表失败' };
  }
}

/**
 * 根据 ID 获取 AI 提供商
 */
export async function getAiProviderById(id: string) {
  try {
    const provider = await db.aiProvider.findUnique({
      where: { id },
    });
    
    if (!provider) {
      return { success: false, error: '提供商不存在' };
    }
    
    return { success: true, data: provider };
  } catch (error) {
    console.error('获取 AI 提供商失败:', error);
    return { success: false, error: '获取提供商失败' };
  }
}

/**
 * 创建新的 AI 提供商
 */
export async function createAiProvider(input: CreateAiProviderInput) {
  try {
    // 获取当前最大的 order 值
    const maxOrder = await db.aiProvider.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const provider = await db.aiProvider.create({
      data: {
        name: input.name,
        type: input.type,
        baseUrl: input.baseUrl,
        apiKey: input.apiKey,
        model: input.model,
        isDefault: false,
        isActive: true,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    revalidatePath('/admin/settings/ai-providers');
    return { success: true, data: provider };
  } catch (error) {
    console.error('创建 AI 提供商失败:', error);
    return { success: false, error: '创建提供商失败' };
  }
}

/**
 * 更新 AI 提供商
 */
export async function updateAiProvider(input: UpdateAiProviderInput) {
  try {
    const { id, ...data } = input;
    
    const provider = await db.aiProvider.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/settings/ai-providers');
    revalidatePath('/admin/settings/ai');
    return { success: true, data: provider };
  } catch (error) {
    console.error('更新 AI 提供商失败:', error);
    return { success: false, error: '更新提供商失败' };
  }
}

/**
 * 删除 AI 提供商
 */
export async function deleteAiProvider(id: string) {
  try {
    // 检查是否是默认提供商
    const provider = await db.aiProvider.findUnique({
      where: { id },
    });

    if (provider?.isDefault) {
      return { success: false, error: '不能删除默认提供商' };
    }

    // 检查是否被翻译器使用
    const config = await db.systemConfig.findFirst();
    if (config?.translatorProviderId === id) {
      return { success: false, error: '该提供商正在被翻译器使用，请先更换' };
    }

    await db.aiProvider.delete({
      where: { id },
    });

    revalidatePath('/admin/settings/ai-providers');
    return { success: true };
  } catch (error) {
    console.error('删除 AI 提供商失败:', error);
    return { success: false, error: '删除提供商失败' };
  }
}

/**
 * 设置默认 AI 提供商
 */
export async function setDefaultAiProvider(id: string) {
  try {
    // 取消所有提供商的默认状态
    await db.aiProvider.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    // 设置新的默认提供商
    const provider = await db.aiProvider.update({
      where: { id },
      data: { isDefault: true },
    });

    revalidatePath('/admin/settings/ai-providers');
    return { success: true, data: provider };
  } catch (error) {
    console.error('设置默认 AI 提供商失败:', error);
    return { success: false, error: '设置默认提供商失败' };
  }
}

/**
 * 更新提供商排序
 */
export async function updateAiProviderOrder(items: { id: string; order: number }[]) {
  try {
    // 批量更新排序
    await Promise.all(
      items.map((item) =>
        db.aiProvider.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    revalidatePath('/admin/settings/ai-providers');
    return { success: true };
  } catch (error) {
    console.error('更新提供商排序失败:', error);
    return { success: false, error: '更新排序失败' };
  }
}
