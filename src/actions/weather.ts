'use server';

import { db } from '@/lib/db';

interface WeatherData {
    location: {
        name: string;
        country: string;
        localtime: string;
    };
    current: {
        temperature: number;
        weather_descriptions: string[];
        weather_icons: string[];
        wind_speed: number;
        humidity: number;
        feelslike: number;
    };
    success?: boolean;
    error?: any;
}

export async function getWeather() {
    try {
        // Cast to any to bypass type checking until prisma generate is run
        let config: any = await db.systemConfig.findFirst();

        try {
            const results = await db.$queryRawUnsafe('SELECT * FROM SystemConfig LIMIT 1') as any[];
            if (results && results.length > 0) {
                config = {
                    ...results[0],
                    weatherEnabled: results[0].weatherEnabled === 1 || results[0].weatherEnabled === true,
                };
            }
        } catch (err) {
            console.error('Get config raw error:', err);
        }
        
        if (!config) {
            return { error: 'System config not found' };
        }

        if (!config.weatherEnabled) {
            return { error: 'Weather disabled' };
        }
        
        if (!config.weatherApiKey) {
            return { error: 'Weather API not configured' };
        }

        const baseUrl = config.weatherUrl || 'http://api.weatherstack.com/current';
        const city = config.weatherCity || 'Beijing';
        const apiKey = config.weatherApiKey;
        const mode = config.weatherKeyMode || 'query';

        let url = `${baseUrl}`;
        const headers: Record<string, string> = {};

        // Construct URL based on key mode
        if (mode === 'query') {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}access_key=${apiKey}&query=${encodeURIComponent(city)}`;
        } else if (mode === 'header') {
            // For header mode, we assume the URL expects query param for city but key in header
            // However, the prompt says: "4) header方式调用是，将填入的api_key填入到X-Proxy-Key中"
            // And typically weatherstack requires access_key in query. 
            // If using a proxy that expects X-Proxy-Key, the proxy likely forwards it or handles auth.
            // So we just add the city query param.
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}query=${encodeURIComponent(city)}`;
            headers['X-Proxy-Key'] = apiKey;
        }

        const response = await fetch(url, {
            headers,
            next: { revalidate: 1800 } // Cache for 30 minutes
        });

        if (!response.ok) {
            throw new Error(`Weather API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            return { error: data.error.info || 'Weather API error' };
        }

        return data as WeatherData;

    } catch (error) {
        console.error('Get weather error:', error);
        return { error: 'Failed to fetch weather data' };
    }
}
