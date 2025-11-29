'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconRenderer } from '@/components/icon-renderer';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Tool {
    id: string;
    name: string;
    nameEn: string;
    description: string | null;
    descriptionEn: string | null;
    icon: string;
    component: string;
    category: string;
}

interface DashboardToolSearchProps {
    tools: Tool[];
    locale: string;
    showInitialResults?: boolean;
}

export function DashboardToolSearch({ tools, locale, showInitialResults = true }: DashboardToolSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const t = useTranslations('Dashboard');
    
    // 根据locale获取工具的显示名称和描述
    const getToolName = (tool: Tool) => {
        return locale === 'zh' ? tool.name : tool.nameEn;
    };
    
    const getToolDescription = (tool: Tool) => {
        return locale === 'zh' 
            ? (tool.description || tool.descriptionEn || '')
            : (tool.descriptionEn || tool.description || '');
    };

    // 过滤工具
    const filteredTools = useMemo(() => {
        if (!searchQuery.trim()) {
            return showInitialResults ? tools : [];
        }

        const query = searchQuery.toLowerCase();
        return tools.filter(tool => {
            const name = tool.name.toLowerCase();
            const nameEn = tool.nameEn.toLowerCase();
            const description = tool.description?.toLowerCase() || '';
            const descriptionEn = tool.descriptionEn?.toLowerCase() || '';
            const category = tool.category.toLowerCase();

            return (
                name.includes(query) ||
                nameEn.includes(query) ||
                description.includes(query) ||
                descriptionEn.includes(query) ||
                category.includes(query)
            );
        });
    }, [tools, searchQuery]);

    return (
        <div className="space-y-4">
            {/* 搜索输入框 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* 搜索结果统计 */}
            {searchQuery && (
                <p className="text-sm text-muted-foreground">
                    {t('searchResults', { count: filteredTools.length })}
                </p>
            )}

            {/* 工具网格 - 仅当有结果显示或初始显示开启时渲染 */}
            {filteredTools.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-left">
                    {filteredTools.map((tool) => (
                        <Link
                            key={tool.id}
                            href={`/admin/tools/${tool.component}`}
                            className="transition-transform hover:scale-105"
                        >
                            <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <IconRenderer 
                                            name={tool.icon} 
                                            className="h-5 w-5 text-primary" 
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <CardTitle className="text-base leading-none">
                                            {getToolName(tool)}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            {tool.category}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="line-clamp-2">
                                        {getToolDescription(tool)}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                        {t('noToolsFound')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('tryDifferentKeywords')}
                    </p>
                </div>
            ) : null}
        </div>
    );
}
