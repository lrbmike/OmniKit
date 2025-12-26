import { getSystemConfig } from '@/actions/system';
import { WeatherSettingsForm } from '@/components/admin/weather-settings-form';

export default async function WeatherSettingsPage() {
    // Cast to any to bypass type checking until prisma generate is run
    const config = await getSystemConfig() as any;

    // Use default values if config is missing
    const defaultConfig = {
        weatherEnabled: false,
        weatherUrl: '',
        weatherApiKey: '',
        weatherKeyMode: 'query',
        weatherCity: '北京',
        weatherQueryKeyName: 'access_key',
        weatherHeaderName: 'X-Proxy-Key',
    };

    return (
        <WeatherSettingsForm
            initialConfig={{
                weatherEnabled: config?.weatherEnabled ?? defaultConfig.weatherEnabled,
                weatherUrl: config?.weatherUrl || defaultConfig.weatherUrl,
                weatherApiKey: config?.weatherApiKey || defaultConfig.weatherApiKey,
                weatherKeyMode: config?.weatherKeyMode || defaultConfig.weatherKeyMode,
                weatherCity: config?.weatherCity || defaultConfig.weatherCity,
                weatherQueryKeyName: config?.weatherQueryKeyName || defaultConfig.weatherQueryKeyName,
                weatherHeaderName: config?.weatherHeaderName || defaultConfig.weatherHeaderName,
            }}
        />
    );
}
