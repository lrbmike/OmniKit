import { getMenuItems, getTools } from '@/actions/menu';
import { MenuEditor } from '@/components/admin/menu-editor';
import { getTranslations } from 'next-intl/server';

export default async function MenuSettingsPage() {
    const t = await getTranslations('Settings.pages.menu');
    const menuItems = await getMenuItems();
    const tools = await getTools();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <MenuEditor initialItems={menuItems} tools={tools} />
        </div>
    );
}
