import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { PasswordGenerator } from '@/components/tools/password-generator';
import { JsonFormatter } from '@/components/tools/json-formatter';
import { QrCodeGenerator } from '@/components/tools/qr-code-generator';

// Map component names to actual components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOL_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'password-generator': PasswordGenerator,
    'json-formatter': JsonFormatter,
    'qr-code-generator': QrCodeGenerator,
    // Add other tools here as they are implemented
};

export default async function ToolPage({
    params,
}: {
    params: Promise<{ component: string; locale: string }>;
}) {
    const { component, locale } = await params;
    const t = await getTranslations('Tools');

    // Fetch tool details from database
    // Use findFirst because component is not marked as unique in schema
    const tool = await db.tool.findFirst({
        where: { component },
    });

    if (!tool || !tool.isActive) {
        notFound();
    }

    const ToolComponent = TOOL_COMPONENTS[component];

    if (!ToolComponent) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Coming Soon</h1>
                <p className="text-gray-500">
                    The tool "{tool.name}" is currently under development.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {locale === 'zh' ? tool.name : tool.nameEn}
                </h1>
                <p className="text-muted-foreground">
                    {locale === 'zh' ? tool.description : tool.descriptionEn}
                </p>
            </div>

            <ToolComponent />
        </div>
    );
}
