'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashProxyApiKey, maskProxyApiKey, normalizeProxyApiKey } from '@/lib/proxy-credentials';
import { ensureProxyService } from '@/lib/proxy-service';
import { getProxyProvider, listProxyProviders } from '@/lib/proxy/providers';

export interface ProxyGatewayConfigView {
  hasApiKey: boolean;
  apiKeyHint: string | null;
}

type ProxyGatewayConfigRecord = {
  id: string;
  proxyGatewayApiKeyHash: string | null;
  proxyGatewayApiKeyHint: string | null;
};

export interface ProxyUpstreamKeyView {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
  failCount: number;
  lastUsedAt: Date | null;
  cooldownUntil: Date | null;
  lastError: string | null;
  hasApiKey: boolean;
}

export interface ProxyServiceListItemView {
  id: string;
  code: string;
  name: string;
  providerType: string;
  isActive: boolean;
  upstreamKeyCount: number;
}

export interface ProxyServiceView {
  id: string;
  code: string;
  name: string;
  providerType: string;
  baseUrl: string;
  timeoutMs: number;
  retryCount: number;
  isActive: boolean;
  upstreamKeys: ProxyUpstreamKeyView[];
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session?.isLoggedIn) {
    throw new Error('Unauthorized');
  }
}

async function ensureSystemConfigRecord() {
  let config = await db.systemConfig.findFirst();

  if (!config) {
    config = await db.systemConfig.create({
      data: {
        isInitialized: true,
        defaultLocale: 'zh',
        defaultTheme: 'system',
        dashboardQuickTools: 'json-formatter,uuid-generator,timestamp-converter,password-generator',
      },
    });
  }

  return config as ProxyGatewayConfigRecord;
}

function mapGatewayConfig(config: Awaited<ReturnType<typeof ensureSystemConfigRecord>>): ProxyGatewayConfigView {
  return {
    hasApiKey: Boolean(config.proxyGatewayApiKeyHash),
    apiKeyHint: config.proxyGatewayApiKeyHint,
  };
}

function mapService(service: NonNullable<Awaited<ReturnType<typeof ensureProxyService>>>): ProxyServiceView {
  return {
    id: service.id,
    code: service.code,
    name: service.name,
    providerType: service.providerType,
    baseUrl: service.baseUrl,
    timeoutMs: service.timeoutMs,
    retryCount: service.retryCount,
    isActive: service.isActive,
    upstreamKeys: service.upstreamKeys.map((key) => ({
      id: key.id,
      name: key.name,
      isActive: key.isActive,
      order: key.order,
      failCount: key.failCount,
      lastUsedAt: key.lastUsedAt,
      cooldownUntil: key.cooldownUntil,
      lastError: key.lastError,
      hasApiKey: Boolean(key.apiKey),
    })),
  };
}

function mapServiceListItem(service: NonNullable<Awaited<ReturnType<typeof ensureProxyService>>>): ProxyServiceListItemView {
  return {
    id: service.id,
    code: service.code,
    name: service.name,
    providerType: service.providerType,
    isActive: service.isActive,
    upstreamKeyCount: service.upstreamKeys.length,
  };
}

export async function getProxyServicesIndexData() {
  await requireAdminSession();

  try {
    const gatewayConfig = await ensureSystemConfigRecord();

    return {
      success: true,
      data: {
        gatewayConfig: mapGatewayConfig(gatewayConfig),
      },
    };
  } catch (error) {
    console.error('Get proxy services index data error:', error);
    return { success: false, error: 'Failed to load proxy services' };
  }
}

export async function getProxyServiceDetail(code: string) {
  await requireAdminSession();

  try {
    const service = await ensureProxyService(code);
    if (!service) {
      return { success: false, error: 'Proxy provider not found' };
    }

    return { success: true, data: mapService(service) };
  } catch (error) {
    console.error('Get proxy service detail error:', error);
    return { success: false, error: 'Failed to load proxy service' };
  }
}

export async function getProxyServicesForNavigation() {
  const services = await Promise.all(
    listProxyProviders().map((provider) => ensureProxyService(provider.code)),
  );

  return services
    .filter((service): service is NonNullable<Awaited<ReturnType<typeof ensureProxyService>>> => Boolean(service))
    .map((service) => mapServiceListItem(service));
}

export async function updateProxyGatewayConfig(input: { apiKey?: string }) {
  await requireAdminSession();

  try {
    const config = await ensureSystemConfigRecord();
    const data: Record<string, string> = {};
    const rawApiKey = input.apiKey?.trim();

    if (rawApiKey) {
      const normalized = normalizeProxyApiKey(rawApiKey);
      data.proxyGatewayApiKeyHash = hashProxyApiKey(normalized);
      data.proxyGatewayApiKeyHint = maskProxyApiKey(normalized);
    }

    const updated = await db.systemConfig.update({
      where: { id: config.id },
      data,
    });

    revalidatePath('/admin/settings/proxy-services');
    return { success: true, data: mapGatewayConfig(updated) };
  } catch (error) {
    console.error('Update proxy gateway config error:', error);
    return { success: false, error: 'Failed to update proxy gateway config' };
  }
}

export async function updateProxyService(input: {
  code: string;
  baseUrl: string;
  timeoutMs: number;
  retryCount: number;
  isActive: boolean;
}) {
  await requireAdminSession();

  try {
    const provider = getProxyProvider(input.code);
    const service = await ensureProxyService(input.code);
    if (!provider || !service) {
      return { success: false, error: 'Proxy provider not found' };
    }

    const updated = await db.proxyService.update({
      where: { id: service.id },
      data: {
        baseUrl: input.baseUrl.trim() || provider.defaultBaseUrl,
        timeoutMs: Math.max(3000, Math.min(input.timeoutMs, 60000)),
        retryCount: Math.max(0, Math.min(input.retryCount, 5)),
        isActive: input.isActive,
      },
      include: {
        upstreamKeys: {
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    revalidatePath('/admin/settings/proxy-services');
    revalidatePath(`/admin/proxy-services/${input.code}`);
    return { success: true, data: mapService(updated) };
  } catch (error) {
    console.error('Update proxy service error:', error);
    return { success: false, error: 'Failed to update proxy service' };
  }
}

export async function updateProxyServiceStatus(input: {
  code: string;
  isActive: boolean;
}) {
  await requireAdminSession();

  try {
    const service = await ensureProxyService(input.code);
    if (!service) {
      return { success: false, error: 'Proxy provider not found' };
    }

    const updated = await db.proxyService.update({
      where: { id: service.id },
      data: {
        isActive: input.isActive,
      },
      include: {
        upstreamKeys: {
          orderBy: [
            { order: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    revalidatePath('/admin/settings/proxy-services');
    revalidatePath(`/admin/proxy-services/${input.code}`);
    revalidatePath('/', 'layout');
    return { success: true, data: mapServiceListItem(updated) };
  } catch (error) {
    console.error('Update proxy service status error:', error);
    return { success: false, error: 'Failed to update proxy service status' };
  }
}

export async function createProxyUpstreamKey(input: { code: string; name: string; apiKey: string }) {
  await requireAdminSession();

  try {
    const service = await ensureProxyService(input.code);
    if (!service) {
      return { success: false, error: 'Proxy provider not found' };
    }

    const maxOrder = await db.proxyUpstreamKey.findFirst({
      where: { proxyServiceId: service.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const key = await db.proxyUpstreamKey.create({
      data: {
        proxyServiceId: service.id,
        name: input.name.trim(),
        apiKey: input.apiKey.trim(),
        isActive: true,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    revalidatePath(`/admin/proxy-services/${input.code}`);
    revalidatePath('/admin/settings/proxy-services');
    return {
      success: true,
      data: {
        id: key.id,
        name: key.name,
        isActive: key.isActive,
        order: key.order,
        failCount: key.failCount,
        lastUsedAt: key.lastUsedAt,
        cooldownUntil: key.cooldownUntil,
        lastError: key.lastError,
        hasApiKey: true,
      },
    };
  } catch (error) {
    console.error('Create proxy upstream key error:', error);
    return { success: false, error: 'Failed to create upstream key' };
  }
}

export async function updateProxyUpstreamKey(input: {
  code: string;
  id: string;
  name: string;
  apiKey?: string;
  isActive: boolean;
}) {
  await requireAdminSession();

  try {
    const data: Record<string, unknown> = {
      name: input.name.trim(),
      isActive: input.isActive,
    };

    if (input.apiKey?.trim()) {
      data.apiKey = input.apiKey.trim();
    }

    const key = await db.proxyUpstreamKey.update({
      where: { id: input.id },
      data,
    });

    revalidatePath(`/admin/proxy-services/${input.code}`);
    revalidatePath('/admin/settings/proxy-services');
    return {
      success: true,
      data: {
        id: key.id,
        name: key.name,
        isActive: key.isActive,
        order: key.order,
        failCount: key.failCount,
        lastUsedAt: key.lastUsedAt,
        cooldownUntil: key.cooldownUntil,
        lastError: key.lastError,
        hasApiKey: true,
      },
    };
  } catch (error) {
    console.error('Update proxy upstream key error:', error);
    return { success: false, error: 'Failed to update upstream key' };
  }
}

export async function deleteProxyUpstreamKey(input: { code: string; id: string }) {
  await requireAdminSession();

  try {
    await db.proxyUpstreamKey.delete({
      where: { id: input.id },
    });

    revalidatePath(`/admin/proxy-services/${input.code}`);
    revalidatePath('/admin/settings/proxy-services');
    return { success: true };
  } catch (error) {
    console.error('Delete proxy upstream key error:', error);
    return { success: false, error: 'Failed to delete upstream key' };
  }
}
