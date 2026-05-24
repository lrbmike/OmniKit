import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getProxyServicesForNavigation } from '@/actions/proxy-service';

export default async function ProxyServicesWorkspacePage() {
  const locale = await getLocale();
  const services = await getProxyServicesForNavigation();

  if (services.length > 0) {
    redirect(`/${locale}/admin/proxy-services/${services[0].code}`);
  }

  redirect(`/${locale}/admin/settings/proxy-services`);
}
