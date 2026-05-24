import { getTranslations } from 'next-intl/server';
import { getProxyServiceDetail } from '@/actions/proxy-service';
import { ProxyServiceDetailManager } from '@/components/admin/proxy-services-manager';

export default async function ProxyServiceMainPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const t = await getTranslations('ProxyWorkspace');
  const result = await getProxyServiceDetail(code);

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to load proxy service');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{result.data.name}</h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <ProxyServiceDetailManager initialService={result.data} />
    </div>
  );
}
