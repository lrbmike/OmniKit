import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { getMenuItems, getTools } from "@/actions/menu";
import { getSystemConfig } from "@/actions/system";
import { IconRenderer } from "@/components/icon-renderer";
import Link from "next/link";
import { Activity, Box, Zap } from "lucide-react";
import { DEFAULT_QUICK_TOOLS } from "@/lib/constants";

export default async function DashboardPage({params}: {params: Promise<{locale: string}>}) {
    const {locale} = await params;
    const t = await getTranslations("Dashboard");
    const [menuItems, allTools, config] = await Promise.all([
        getMenuItems(),
        getTools(),
        getSystemConfig()
    ]);
    
    // 计算已启用的工具数量 (在菜单中的工具)
    let activeToolsCount = 0;
    menuItems.forEach(item => {
        if (item.tool) activeToolsCount++;
        if (item.children) {
            item.children.forEach(child => {
                if (child.tool) activeToolsCount++;
            });
        }
    });

    // 快捷工具 IDs (从配置读取，或使用默认值)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configuredTools = (config as any)?.dashboardQuickTools 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? ((config as any).dashboardQuickTools as string).split(',') 
        : [];
        
    const quickToolIds = configuredTools.length > 0 
        ? configuredTools 
        : DEFAULT_QUICK_TOOLS;
        
    const quickTools = allTools.filter(tool => quickToolIds.includes(tool.component));
    

    const getToolName = (tool: typeof allTools[0]) => {
        return locale === 'zh' ? tool.name : tool.nameEn;
    };
    
    const getToolDescription = (tool: typeof allTools[0]) => {
        return locale === 'zh' 
            ? (tool.description || tool.descriptionEn || '')
            : (tool.descriptionEn || tool.description || '');
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('welcomeTitle')}</h1>
                <p className="text-muted-foreground">
                    {t('welcomeDescription')}
                </p>
            </div>

            {/* 1. Stats Section */}
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('totalTools')}
                        </CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18</div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                                {t('availableInLibrary')}
                            </p>
                            <Link 
                                href={`/${locale}/admin/settings/menu`} 
                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                {t('configureMenu')}
                                <Box className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t('activeTools')}
                        </CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeToolsCount}</div>
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
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{t('healthy')}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('allSystemsOperational')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Quick Links */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">{t('quickTools')}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {quickTools.map((tool) => (
                        <Link
                            key={tool.id}
                            href={`/admin/tools/${tool.component}`}
                            className="group block transition-all hover:-translate-y-1"
                        >
                            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow border-muted-foreground/20 hover:border-primary/50">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-3">
                                        <IconRenderer 
                                            name={tool.icon} 
                                            className="h-5 w-5 text-primary" 
                                        />
                                    </div>
                                    <CardTitle className="text-sm font-medium leading-tight">
                                        {getToolName(tool)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {getToolDescription(tool)}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
