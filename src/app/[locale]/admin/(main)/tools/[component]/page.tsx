import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import { PasswordGenerator } from '@/components/tools/password-generator';
import { JsonFormatter } from '@/components/tools/json-formatter';
import { QrCodeGenerator } from '@/components/tools/qr-code-generator';
import { ColorPicker } from '@/components/tools/color-picker';
import { Base64Encoder } from '@/components/tools/base64-encoder';
import { HashCalculator } from '@/components/tools/hash-calculator';
import { UrlEncoder } from '@/components/tools/url-encoder';
import { MarkdownPreview } from '@/components/tools/markdown-preview';
import { RegexTester } from '@/components/tools/regex-tester';
import { TimestampConverter } from '@/components/tools/timestamp-converter';
import { UuidGenerator } from '@/components/tools/uuid-generator';
import { JwtDecoder } from '@/components/tools/jwt-decoder';
import { GradientGenerator } from '@/components/tools/gradient-generator';
import { ContrastChecker } from '@/components/tools/contrast-checker';
import { ImageCompressor } from '@/components/tools/image-compressor';
import { ImageToBase64 } from '@/components/tools/image-to-base64';
import { TextDiff } from '@/components/tools/text-diff';
import { WordCounter } from '@/components/tools/word-counter';
import Translator from '@/components/tools/translator';
import VarNameGenerator from '@/components/tools/var-name-generator';
import { GithubUploader } from '@/components/tools/github-uploader';
import { ClipboardNotes } from '@/components/tools/clipboard-notes';
import { CloudinaryUploader } from '@/components/tools/cloudinary-uploader';
import { TinyPngCompressor } from '@/components/tools/tiny-png-compressor';
import { QRScanner } from '@/components/tools/qr-scanner';

// Map component names to actual components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOL_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'password-generator': PasswordGenerator,
    'json-formatter': JsonFormatter,
    'qr-code-generator': QrCodeGenerator,
    'color-picker': ColorPicker,
    'base64-encoder': Base64Encoder,
    'hash-calculator': HashCalculator,
    'url-encoder': UrlEncoder,
    'markdown-preview': MarkdownPreview,
    'regex-tester': RegexTester,
    'timestamp-converter': TimestampConverter,
    'uuid-generator': UuidGenerator,
    'jwt-decoder': JwtDecoder,
    'gradient-generator': GradientGenerator,
    'contrast-checker': ContrastChecker,
    'image-compressor': ImageCompressor,
    'image-to-base64': ImageToBase64,
    'text-diff': TextDiff,
    'word-counter': WordCounter,
    'translator': Translator,
    'var-name-generator': VarNameGenerator,
    'github-uploader': GithubUploader,
    'clipboard-notes': ClipboardNotes,
    'cloudinary-uploader': CloudinaryUploader,
    'tiny-png-compressor': TinyPngCompressor,
    'qr-scanner': QRScanner,
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
