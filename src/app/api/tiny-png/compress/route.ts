import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const apiKey = formData.get('apiKey') as string;
    const resizeStr = formData.get('resize') as string | null;

    if (!image || !apiKey) {
      return NextResponse.json(
        { error: 'Missing image or API key' },
        { status: 400 }
      );
    }

    // 动态导入 tinify 并设置 API 密钥
    // 使用 require 以避免 ES 模块的只读属性问题
    const tinify = require('tinify');
    tinify.key = apiKey;

    // 将文件转换为 buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 压缩图像
    let source = tinify.fromBuffer(buffer);

    // 如果提供了调整大小选项
    if (resizeStr) {
      try {
        const resizeOptions = JSON.parse(resizeStr);
        if (resizeOptions.width || resizeOptions.height) {
          const method = resizeOptions.method || 'scale';
          const resizeConfig: any = { method };


          if (method === 'scale' && (resizeOptions.width || resizeOptions.height)) {
            if (resizeOptions.width && resizeOptions.height) {
              resizeConfig.width = resizeOptions.width;
              resizeConfig.height = resizeOptions.height;
            } else if (resizeOptions.width) {
              resizeConfig.width = resizeOptions.width;
            } else if (resizeOptions.height) {
              resizeConfig.height = resizeOptions.height;
            }
          } else {
            if (resizeOptions.width) resizeConfig.width = resizeOptions.width;
            if (resizeOptions.height) resizeConfig.height = resizeOptions.height;
          }

          source = source.resize(resizeConfig);
        }
      } catch (error) {
        console.error('Resize error:', error);
        // 忽略调整大小错误，继续压缩
      }
    }

    // 获取压缩后的数据
    const compressedBuffer = await source.toBuffer();

    // 对文件名进行 URL 编码以支持中文等非 ASCII 字符
    const encodedFilename = encodeURIComponent(image.name);

    // 返回压缩后的图像
    return new NextResponse(compressedBuffer as any, {
      headers: {
        'Content-Type': image.type,
        'Content-Length': compressedBuffer.length.toString(),
        // 使用 RFC 5987 编码格式支持 Unicode 文件名
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error: any) {
    console.error('TinyPNG compression error:', error);

    // 处理 TinyPNG API 错误
    if (error.message?.includes('Invalid API key')) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    if (error.message?.includes('Compression failed')) {
      return NextResponse.json(
        { error: 'Image compression failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Compression failed' },
      { status: 500 }
    );
  }
}