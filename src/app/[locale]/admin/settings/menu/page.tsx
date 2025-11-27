import { getMenuItems } from '@/actions/menu';
import { MenuEditor } from '@/components/admin/menu-editor';
import { getTranslations } from 'next-intl/server';

export default async function MenuSettingsPage() {
    const t = await getTranslations('Settings');
    const menuItems = await getMenuItems();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
                <p className="text-muted-foreground">
                    Customize the sidebar menu structure. Create folders and organize your tools.
                </p>
            </div>

            <MenuEditor initialItems={menuItems} />
        </div>
    );
}
