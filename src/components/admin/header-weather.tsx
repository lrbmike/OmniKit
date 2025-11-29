'use client';

import { CloudSun, Loader2, CloudOff, Wind, Droplets, ThermometerSun, Sun, Eye, Gauge } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getWeather } from '@/actions/weather';
import { useTranslations } from 'next-intl';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

// Module-level cache to prevent duplicate requests in Strict Mode or navigation
let weatherPromise: Promise<any> | null = null;

export function HeaderWeather() {
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations('Settings.pages.weather.errors');
    const tDetails = useTranslations('Settings.pages.weather.details');

    const fetchWeather = useCallback(async (force = false) => {
        try {
            // 1. Check localStorage first (if not forced)
            if (!force) {
                const cached = localStorage.getItem('omnikit_weather');
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    // Valid for 15 minutes
                    if (Date.now() - timestamp < 15 * 60 * 1000) {
                        setWeather(data);
                        setLoading(false);
                        return;
                    }
                }
            }

            // 2. Deduplicate in-flight requests
            if (!weatherPromise) {
                weatherPromise = getWeather().then(data => {
                    // Delay clearing promise slightly to ensure all consumers get it
                    setTimeout(() => { weatherPromise = null; }, 100);
                    
                    if (!data.error) {
                        // Save to cache
                        localStorage.setItem('omnikit_weather', JSON.stringify({
                            data,
                            timestamp: Date.now()
                        }));
                    }
                    return data;
                });
            }

            const data = await weatherPromise;
            
            if (data.error) {
                setError(data.error);
            } else {
                setWeather(data);
                setError(null);
            }
        } catch (err) {
            console.error(err);
            setError('FETCH_FAILED');
            weatherPromise = null; // Reset on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather();
        
        // Refresh every 15 minutes
        const interval = setInterval(() => {
             fetchWeather(true);
        }, 15 * 60 * 1000);

        // Listen for config updates
        const handleConfigUpdate = () => {
            weatherPromise = null; // Clear promise
            fetchWeather(true); // Force refresh
        };
        
        window.addEventListener('weather-config-updated', handleConfigUpdate);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('weather-config-updated', handleConfigUpdate);
        };
    }, [fetchWeather]);

    if (loading) {
        return (
            <div className="flex items-center px-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !weather) {
        // If error is due to missing config, we might want to hide it or show a config hint
        // For now, showing a subtle error state or just hidden if not critical
        if (error === 'API_NOT_CONFIGURED' || error === 'WEATHER_DISABLED' || error === 'CONFIG_NOT_FOUND') {
             return null; // Hide if not configured
        }
        
        // Translate error message
        const errorMessage = error ? t(error as any) : 'N/A';

        return (
             <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium hidden md:flex"
                title={errorMessage}
            >
                <CloudOff className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{errorMessage}</span>
            </div>
        );
    }

    const { current, location } = weather;

    return (
        <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
                <div 
                    onClick={() => {
                        setLoading(true);
                        fetchWeather(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer text-sm font-medium hidden md:flex select-none"
                >
                    {current.weather_icons && current.weather_icons[0] ? (
                        <img 
                            src={current.weather_icons[0]} 
                            alt="Weather Icon" 
                            className="h-5 w-5 rounded-full object-cover"
                        />
                    ) : (
                        <CloudSun className="h-4 w-4" />
                    )}
                    <span>{current.temperature}°C</span>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" align="end">
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-sm font-semibold">{location.name}, {location.country}</h4>
                            <p className="text-xs text-muted-foreground">{current.weather_descriptions[0]}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold">{current.temperature}°C</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Wind className="h-3 w-3" />
                            <span>{tDetails('wind')}: {current.wind_speed} km/h {current.wind_dir}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Droplets className="h-3 w-3" />
                            <span>{tDetails('humidity')}: {current.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <ThermometerSun className="h-3 w-3" />
                            <span>{tDetails('feelsLike')}: {current.feelslike}°C</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Sun className="h-3 w-3" />
                            <span>{tDetails('uv')}: {current.uv_index}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{tDetails('visibility')}: {current.visibility} km</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Gauge className="h-3 w-3" />
                            <span>{tDetails('pressure')}: {current.pressure} hPa</span>
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-muted-foreground text-right pt-2 border-t">
                        Updated: {location.localtime}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
