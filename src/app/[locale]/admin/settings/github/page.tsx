import { getSystemConfig } from '@/actions/system';
import { GithubSettingsForm } from '@/components/admin/github-settings-form';

export default async function GithubSettingsPage() {
    const config = await getSystemConfig() as any;

    return (
        <GithubSettingsForm
            initialConfig={{
                githubToken: config?.githubToken || '',
            }}
        />
    );
}
