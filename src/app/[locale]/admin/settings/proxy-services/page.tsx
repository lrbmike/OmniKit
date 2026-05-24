import { getTranslations } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import { ProxyServicesIndexManager } from '@/components/admin/proxy-services-manager';
import { getProxyServicesIndexData } from '@/actions/proxy-service';

export default async function ProxyServicesPage() {
  const t = await getTranslations('Settings.pages.proxyServices');
  const result = await getProxyServicesIndexData();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to load proxy services');
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <Separator />
      <ProxyServicesIndexManager initialGatewayConfig={result.data.gatewayConfig} />
    </div>
  );
}
