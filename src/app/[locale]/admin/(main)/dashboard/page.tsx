import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { getMenuItems } from "@/actions/menu";
import { IconRenderer } from "@/components/icon-renderer";
import Link from "next/link";
import { Activity, Box, Zap } from "lucide-react";

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

    // 快捷工具 IDs (模拟配置)
    const quickToolIds = ['json-formatter', 'uuid-generator', 'base64-encoder', 'image-compressor', 'qrcode-generator', 'color-picker'];
    const quickTools = allTools.filter(tool => quickToolIds.includes(tool.component));
    // 如果没找到对应的工具，则补几个
    if (quickTools.length < 6 && allTools.length > 0) {
        const remaining = 6 - quickTools.length;
        const others = allTools.filter(t => !quickToolIds.includes(t.component)).slice(0, remaining);
        quickTools.push(...others);
    }

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
