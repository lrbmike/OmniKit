import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { getMenuItems } from "@/actions/menu";
import { DashboardToolSearch } from "@/components/admin/dashboard-tool-search";

export default async function DashboardPage({params}: {params: Promise<{locale: string}>}) {
    const {locale} = await params;
    const t = await getTranslations("Dashboard");
    const menuItems = await getMenuItems();
    
    // 扁平化菜单项，提取所有工具
    const allTools: Array<{
        id: string;
        name: string;
        nameEn: string;
        description: string | null;
        descriptionEn: string | null;
        icon: string;
        component: string;
        category: string;
    }> = [];
    
    menuItems.forEach(item => {
        if (item.tool) {
            allTools.push(item.tool);
        }
        if (item.children) {
            item.children.forEach(child => {
                if (child.tool) {
                    allTools.push(child.tool);
                }
            });
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground mt-2">{t('description')}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('totalTools')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <p className="text-xs text-muted-foreground">
                            {t('availableInLibrary')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('activeTools')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allTools.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('enabledInMenu')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('systemStatus')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{t('healthy')}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('allSystemsOperational')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 工具搜索和展示 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('toolSearch')}</CardTitle>
                    <CardDescription>{t('toolSearchDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <DashboardToolSearch tools={allTools} locale={locale} />
                </CardContent>
            </Card>
        </div>
    );
}
