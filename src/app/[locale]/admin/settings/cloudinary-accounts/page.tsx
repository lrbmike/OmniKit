import { getCloudinaryAccounts } from '@/actions/cloudinary-account';
import { CloudinaryAccountsManager } from '@/components/admin/cloudinary-accounts-manager';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';

export default async function CloudinaryAccountsPage() {
    const t = await getTranslations('Settings.pages.cloudinaryAccounts');
    const result = await getCloudinaryAccounts();
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
            <CloudinaryAccountsManager initialAccounts={accounts} />
        </div>
    );
}