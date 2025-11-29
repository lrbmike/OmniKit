'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { IconRenderer } from '@/components/icon-renderer';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

interface HeaderSearchProps {
    tools: Tool[];
    locale: string;
}

export function HeaderSearch({ tools, locale }: HeaderSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Dashboard');

    // Simple click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredTools = useMemo(() => {
        if (!query.trim()) return [];
        
        const searchTerms = query.toLowerCase().split(' ');
        
        return tools.filter(tool => {
            const name = (locale === 'zh' ? tool.name : tool.nameEn).toLowerCase();
            const description = (locale === 'zh' 
                ? (tool.description || tool.descriptionEn || '')
                : (tool.descriptionEn || tool.description || '')).toLowerCase();
            const category = tool.category.toLowerCase();
            
            return searchTerms.every(term => 
                name.includes(term) || 
                description.includes(term) || 
                category.includes(term)
            );
        }).slice(0, 5); // Limit to 5 results for dropdown
    }, [tools, query, locale]);

    const handleFocus = () => {
        if (query.trim()) setIsOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsOpen(!!e.target.value.trim());
    };

    const handleSelect = () => {
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div className="relative w-full max-w-md mx-4" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    className="pl-9 w-full bg-muted/50 focus:bg-background transition-colors"
                    value={query}
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
                {query && (
                    <button 
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                        }}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && filteredTools.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                    <Card className="overflow-hidden shadow-lg border-border/50">
                        <div className="p-1">
                            {filteredTools.map((tool) => (
                                <Link
                                    key={tool.id}
                                    href={`/admin/tools/${tool.component}`}
                                    onClick={handleSelect}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <IconRenderer name={tool.icon} className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-medium truncate">
                                            {locale === 'zh' ? tool.name : tool.nameEn}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {locale === 'zh' 
                                                ? (tool.description || tool.descriptionEn) 
                                                : (tool.descriptionEn || tool.description)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="bg-muted/50 p-2 text-xs text-center text-muted-foreground border-t">
                            {t('searchResults', { count: filteredTools.length })}
                        </div>
                    </Card>
                </div>
            )}

            {isOpen && query.trim() && filteredTools.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                    <Card className="p-4 text-center text-sm text-muted-foreground shadow-lg border-border/50">
                        {t('noToolsFound')}
                    </Card>
                </div>
            )}
        </div>
    );
}
