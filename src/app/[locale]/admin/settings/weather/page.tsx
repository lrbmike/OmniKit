import { getSystemConfig } from '@/actions/system';
import { WeatherSettingsForm } from '@/components/admin/weather-settings-form';

export default async function WeatherSettingsPage() {
    // Cast to any to bypass type checking until prisma generate is run
    const config = await getSystemConfig() as any;

    if (!config) {
        return null;
    }

    return (
        <WeatherSettingsForm
            initialConfig={{
                weatherEnabled: config.weatherEnabled || false,
                weatherUrl: config.weatherUrl || '',
                weatherApiKey: config.weatherApiKey || '',
                weatherKeyMode: config.weatherKeyMode || 'query',
                weatherCity: config.weatherCity || '北京',
            }}
        />
    );
}
