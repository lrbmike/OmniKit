import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 18 Preset Tools Definition
const PRESET_TOOLS = [
    // Developer Tools (7)
    {
        name: 'JSON 格式化',
        nameEn: 'JSON Formatter',
        description: 'JSON 格式化、验证、压缩工具',
        descriptionEn: 'JSON format, validate, and minify tool',
        icon: 'Braces',
        category: 'developer',
        component: 'json-formatter',
        order: 1,
    },
    {
        name: 'Base64 编解码',
        nameEn: 'Base64 Encoder',
        description: 'Base64 编码和解码工具',
        descriptionEn: 'Base64 encode and decode tool',
        icon: 'Binary',
        category: 'developer',
        component: 'base64-encoder',
        order: 2,
    },
    {
        name: 'URL 编解码',
        nameEn: 'URL Encoder',
        description: 'URL 编码和解码工具',
        descriptionEn: 'URL encode and decode tool',
        icon: 'Link',
        category: 'developer',
        component: 'url-encoder',
        order: 3,
    },
    {
        name: 'Markdown 预览',
        nameEn: 'Markdown Preview',
        description: 'Markdown 实时预览工具',
        descriptionEn: 'Markdown live preview tool',
        icon: 'FileText',
        category: 'developer',
        component: 'markdown-preview',
        order: 4,
    },
    {
        name: '正则表达式测试',
        nameEn: 'Regex Tester',
        description: '正则表达式测试和匹配工具',
        descriptionEn: 'Regular expression test and match tool',
        icon: 'Search',
        category: 'developer',
        component: 'regex-tester',
        order: 5,
    },
    {
        name: '时间戳转换',
        nameEn: 'Timestamp Converter',
        description: 'Unix 时间戳转换工具',
        descriptionEn: 'Unix timestamp converter tool',
        icon: 'Clock',
        category: 'developer',
        component: 'timestamp-converter',
        order: 6,
    },
    {
        name: 'UUID 生成器',
        nameEn: 'UUID Generator',
        description: 'UUID/GUID 生成工具',
        descriptionEn: 'UUID/GUID generator tool',
        icon: 'Hash',
        category: 'developer',
        component: 'uuid-generator',
        order: 7,
    },

    // Security Tools (3)
    {
        name: '密码生成器',
        nameEn: 'Password Generator',
        description: '随机密码生成工具',
        descriptionEn: 'Random password generator tool',
        icon: 'Key',
        category: 'security',
        component: 'password-generator',
        order: 1,
    },
    {
        name: 'Hash 计算',
        nameEn: 'Hash Calculator',
        description: 'MD5/SHA1/SHA256 哈希计算工具',
        descriptionEn: 'MD5/SHA1/SHA256 hash calculator tool',
        icon: 'Shield',
        category: 'security',
        component: 'hash-calculator',
        order: 2,
    },
    {
        name: 'JWT 解析',
        nameEn: 'JWT Decoder',
        description: 'JWT Token 解析工具',
        descriptionEn: 'JWT Token decoder tool',
        icon: 'Lock',
        category: 'security',
        component: 'jwt-decoder',
        order: 3,
    },

    // Color Tools (3)
    {
        name: '颜色选择器',
        nameEn: 'Color Picker',
        description: 'RGB/HEX/HSL 颜色选择工具',
        descriptionEn: 'RGB/HEX/HSL color picker tool',
        icon: 'Palette',
        category: 'color',
        component: 'color-picker',
        order: 1,
    },
    {
        name: '渐变生成器',
        nameEn: 'Gradient Generator',
        description: 'CSS 渐变代码生成工具',
        descriptionEn: 'CSS gradient code generator tool',
        icon: 'Droplet',
        category: 'color',
        component: 'gradient-generator',
        order: 2,
    },
    {
        name: '颜色对比检测',
        nameEn: 'Contrast Checker',
        description: 'WCAG 颜色对比度检测工具',
        descriptionEn: 'WCAG color contrast checker tool',
        icon: 'Eye',
        category: 'color',
        component: 'contrast-checker',
        order: 3,
    },

    // Image Tools (3)
    {
        name: '二维码生成器',
        nameEn: 'QR Code Generator',
        description: '二维码生成和下载工具',
        descriptionEn: 'QR code generator and download tool',
        icon: 'QrCode',
        category: 'image',
        component: 'qr-code-generator',
        order: 1,
    },
    {
        name: '图片压缩',
        nameEn: 'Image Compressor',
        description: '图片压缩优化工具',
        descriptionEn: 'Image compression and optimization tool',
        icon: 'ImageDown',
        category: 'image',
        component: 'image-compressor',
        order: 2,
    },
    {
        name: 'Base64 图片转换',
        nameEn: 'Image to Base64',
        description: '图片转 Base64 编码工具',
        descriptionEn: 'Image to Base64 encoder tool',
        icon: 'Image',
        category: 'image',
        component: 'image-to-base64',
        order: 3,
    },

    // Text Tools (2)
    {
        name: '文本差异对比',
        nameEn: 'Text Diff',
        description: '文本差异对比工具',
        descriptionEn: 'Text difference comparison tool',
        icon: 'FileSearch',
        category: 'text',
        component: 'text-diff',
        order: 1,
    },
    {
        name: '字数统计',
        nameEn: 'Word Counter',
        description: '字符/单词/行数统计工具',
        descriptionEn: 'Character/word/line counter tool',
        icon: 'Type',
        category: 'text',
        component: 'word-counter',
        order: 2,
    },

    // AI Tools (1)
    {
        name: '文本翻译',
        nameEn: 'Text Translation',
        description: '智能中英互译工具',
        descriptionEn: 'Intelligent English-Chinese translator',
        icon: 'Languages',
        category: 'ai',
        component: 'translator',
        order: 1,
    },
];

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.menuItem.deleteMany();
    await prisma.tool.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.systemConfig.deleteMany();

    // Create system config
    // console.log('⚙️  Creating system config...');
    // await prisma.systemConfig.create({
    //     data: {
    //         isInitialized: false,
    //         defaultLocale: 'zh',
    //         dbType: 'sqlite',
    //         sessionTimeout: 604800, // 7 days
    //     },
    // });

    // Create tools
    console.log('🛠️  Creating 18 preset tools...');
    const createdTools = await Promise.all(
        PRESET_TOOLS.map((tool) =>
            prisma.tool.create({
                data: tool,
            })
        )
    );
    console.log(`✅ Created ${createdTools.length} tools`);

    // Create default menu structure
    console.log('📁 Creating default menu structure...');

    // Developer Tools Folder
    const devFolder = await prisma.menuItem.create({
        data: {
            userId: 'default-admin',
            label: '开发工具',
            labelEn: 'Developer Tools',
            icon: 'Code',
            isFolder: true,
            order: 1,
        },
    });

    // Filter specific developer tools: json-formatter, url-encoder
    const devTools = createdTools.filter(t => 
        t.category === 'developer' && ['json-formatter', 'url-encoder'].includes(t.component)
    );
    
    for (let i = 0; i < devTools.length; i++) {
        await prisma.menuItem.create({
            data: {
                userId: 'default-admin',
                parentId: devFolder.id,
                toolId: devTools[i].id,
                order: i + 1,
                isFolder: false,
            },
        });
    }

    // Security Tools Folder
    const securityFolder = await prisma.menuItem.create({
        data: {
            userId: 'default-admin',
            label: '安全工具',
            labelEn: 'Security Tools',
            icon: 'Shield',
            isFolder: true,
            order: 2,
        },
    });

    // Filter specific security tools: password-generator
    const securityTools = createdTools.filter(t => 
        t.category === 'security' && ['password-generator'].includes(t.component)
    );

    for (let i = 0; i < securityTools.length; i++) {
        await prisma.menuItem.create({
            data: {
                userId: 'default-admin',
                parentId: securityFolder.id,
                toolId: securityTools[i].id,
                order: i + 1,
                isFolder: false,
            },
        });
    }

    // AI Tools Folder
    const aiFolder = await prisma.menuItem.create({
        data: {
            userId: 'default-admin',
            label: 'AI 工具',
            labelEn: 'AI Tools',
            icon: 'Sparkles',
            isFolder: true,
            order: 3,
        },
    });

    // Filter specific AI tools: translator
    const aiTools = createdTools.filter(t => 
        t.category === 'ai' && ['translator'].includes(t.component)
    );

    for (let i = 0; i < aiTools.length; i++) {
        await prisma.menuItem.create({
            data: {
                userId: 'default-admin',
                parentId: aiFolder.id,
                toolId: aiTools[i].id,
                order: i + 1,
                isFolder: false,
            },
        });
    }

    console.log('✅ Default menu structure created');

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
