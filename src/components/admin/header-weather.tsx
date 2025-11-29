'use client';

import { CloudSun, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function HeaderWeather() {
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Dashboard');

    useEffect(() => {
        // Mock loading
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center px-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-help text-sm font-medium hidden md:flex"
            title={`Shanghai, China - ${t('weatherPlaceholder')}`}
        >
            <CloudSun className="h-4 w-4" />
            <span>24°C</span>
        </div>
    );
}
