'use client';

import { useState, useEffect } from 'react';
import { IconRenderer } from '@/components/icon-renderer';
import { Check, Plus, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface QuickToolSelectorProps {
    tools: Tool[];
    selectedTools: string[]; // Array of tool component names
    onChange: (tools: string[]) => void;
    maxTools?: number;
}

export function QuickToolSelector({ tools, selectedTools, onChange, maxTools = 4 }: QuickToolSelectorProps) {
    const tSystem = useTranslations('Settings.pages.system');
    const tDashboard = useTranslations('Settings.pages.dashboard');
    const locale = useLocale();

    const toggleTool = (component: string) => {
        if (selectedTools.includes(component)) {
            onChange(selectedTools.filter(t => t !== component));
        } else {
            if (selectedTools.length < maxTools) {
                onChange([...selectedTools, component]);
            }
        }
    };

    const getToolName = (tool: Tool) => {
        return locale === 'zh' ? tool.name : tool.nameEn;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">
                    {tSystem('selected', { count: selectedTools.length })}
                </div>
                <div className="text-xs text-muted-foreground">
                    {maxTools - selectedTools.length} remaining
                </div>
            </div>

            {/* Selected Tools Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedTools.map(component => {
                    const tool = tools.find(t => t.component === component);
                    if (!tool) return null;
                    return (
                        <Card key={component} className="p-3 relative group border-primary/50 bg-primary/5">
                            <button
                                onClick={() => toggleTool(component)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X className="h-3 w-3" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded bg-primary/10">
                                    <IconRenderer name={tool.icon} className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-xs font-medium truncate">
                                    {getToolName(tool)}
                                </div>
                            </div>
                        </Card>
                    );
                })}
                {Array.from({ length: Math.max(0, maxTools - selectedTools.length) }).map((_, i) => (
                    <div key={i} className="border border-dashed rounded-lg p-3 flex items-center justify-center text-muted-foreground/50 bg-muted/20 h-[58px]">
                        <Plus className="h-4 w-4" />
                    </div>
                ))}
            </div>

            <div className="border-t pt-4">
                <div className="text-sm font-medium mb-3">{tDashboard('quickToolsDescription')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                    {tools.map(tool => {
                        const isSelected = selectedTools.includes(tool.component);
                        const isDisabled = !isSelected && selectedTools.length >= maxTools;
                        
                        return (
                            <button
                                key={tool.id}
                                onClick={() => !isDisabled && toggleTool(tool.component)}
                                disabled={isDisabled}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-md border text-left transition-all hover:border-primary/50",
                                    isSelected 
                                        ? "border-primary bg-primary/5" 
                                        : "bg-card hover:bg-accent",
                                    isDisabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-card"
                                )}
                            >
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {isSelected ? <Check className="h-4 w-4" /> : <IconRenderer name={tool.icon} className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {getToolName(tool)}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {tool.category}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
