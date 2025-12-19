import { getTinyPngAccounts } from '@/actions/tiny-png';
import { TinyPngAccountsManager } from '@/components/admin/tiny-png-accounts-manager';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';

export default async function TinyPngAccountsPage() {
  const t = await getTranslations('Settings.pages.tinyPngAccounts');
  const result = await getTinyPngAccounts();
  const accounts = (result.success && result.data) ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>
      <Separator />
      <TinyPngAccountsManager initialAccounts={accounts} />
    </div>
  );
}