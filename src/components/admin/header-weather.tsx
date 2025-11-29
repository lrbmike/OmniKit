'use client';

import { CloudSun, Loader2, CloudOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWeather } from '@/actions/weather';

// Module-level cache to prevent duplicate requests in Strict Mode or navigation
let weatherPromise: Promise<any> | null = null;

export function HeaderWeather() {
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async (force = false) => {
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
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load weather');
                weatherPromise = null; // Reset on error
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
        
        // Refresh every 15 minutes
        const interval = setInterval(() => {
             fetchWeather(true);
        }, 15 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

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
        if (error === 'Weather API not configured') {
             return null; // Hide if not configured
        }
        
        return (
             <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium hidden md:flex"
                title={error || 'Weather unavailable'}
            >
                <CloudOff className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{error || 'N/A'}</span>
            </div>
        );
    }

    const { current, location } = weather;

    return (
        <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-help text-sm font-medium hidden md:flex"
            title={`${location.name}, ${location.country} - ${current.weather_descriptions[0]}`}
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
    );
}
