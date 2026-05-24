# OmniKit - 多功能开发工具集

一个基于 Next.js 15 构建的强大、可扩展的管理系统，旨在通过统一的界面管理多种开发工具。

## 🚀 核心技术

- **框架**: Next.js 15 (App Router) + React 19
- **数据库**: SQLite + Prisma ORM
- **界面**: Tailwind CSS + ShadcnUI + Lucide 图标
- **身份认证**: `iron-session` 安全会话管理
- **国际化**: `next-intl` (中英文)
- **状态管理**: Zustand

## 🧰 可用工具 (24 个)

### 开发工具 (8 个)
- **JSON 格式化**: 格式化、压缩和验证 JSON 数据
- **Base64 编解码**: Base64 文本编码和解码
- **URL 编解码**: URL 参数编码和解码
- **Markdown 预览**: 实时 Markdown 编辑和预览
- **正则表达式测试**: 测试正则表达式匹配
- **时间戳转换**: Unix 时间戳与日期互转
- **UUID 生成器**: 生成随机 UUID (v4)
- **路径转换器**: Windows 和 Unix/Linux 路径格式互转

### 安全工具 (3 个)
- **密码生成器**: 生成安全的随机密码,支持自定义选项
- **Hash 计算**: 计算 MD5、SHA1、SHA256 哈希值
- **JWT 解析**: 解析和检查 JSON Web Token

### 颜色工具 (3 个)
- **颜色选择器**: 选择和转换颜色 (HEX、RGB、HSL)
- **渐变生成器**: 创建 CSS 线性和径向渐变
- **颜色对比检测**: 检查 WCAG 颜色对比度可访问性标准

### 图片工具 (4 个)
- **二维码生成器**: 生成和下载二维码
- **图片压缩**: 压缩和优化图片
- **图片 Base64 转换**: 图片与 Base64 字符串互转
- **TinyPNG 压缩**: 使用 TinyPNG API 进行高质量图片压缩

### 文本工具 (2 个)
- **文本差异对比**: 比较两段文本并高亮显示差异
- **字数统计**: 统计字符、单词、行数和段落数

### AI 工具 (2 个)
- **文本翻译**: AI 驱动的智能中英文双向翻译
- **变量名生成器**: AI 智能生成变量名建议

### 存储工具 (2 个)
- **GitHub 上传**: 上传文件到 GitHub 并通过 jsDelivr 获取 CDN 链接
- **Cloudinary 图片上传**: 上传图片到 Cloudinary 云存储

### 实用工具 (2 个)
- **剪贴板笔记**: 管理您的笔记和剪贴板内容
- **二维码扫描器**: 从图片中扫描二维码,提取 URL 或文本

## 🔌 代理服务

当前已支持第一版外部反向代理能力,用于把第三方 API 统一收敛到 OmniKit 后台管理。

- **已实现 Provider**: Brave Search
- **统一入口**: `/api/proxy/[serviceCode]/[...path]`
- **后台能力**:
  - 配置服务开关、Base URL、超时、失败切换次数
  - 配置对外 API Key,用于校验外部系统调用
  - 配置多个上游 API Key,支持失败切换和冷却
- **设计方式**:
  - 统一路由负责鉴权、轮询、转发、失败处理
  - Provider 注册表负责路径白名单、上游 URL 拼装、鉴权头构造

### Brave Search 调用示例

1. 在后台 `设置 -> 代理服务` 中配置:
   - 对外 API Key
   - 一个或多个 Brave Search 上游 API Key
2. 调用统一代理接口:

```bash
curl -X GET \
  'http://localhost:3000/api/proxy/brave-search/web/search?q=nextjs' \
  -H 'Authorization: Bearer your_proxy_api_key'
```

后续如果增加新的代理 Provider,只需要补充一个新的 provider 模块并注册到系统中,无需重写统一转发逻辑。

## 🛠️ 快速开始

### 环境要求

- Node.js 18+
- pnpm (推荐)

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/omnikit.git
   cd omnikit
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **初始化数据库**
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```

   本地使用 SQLite 时，建议配置 `DATABASE_URL="file:../data/omnikit.db"`。

4. **启动开发服务器**
   ```bash
   pnpm dev
   ```

5. **访问应用**
   
   在浏览器中打开 [http://localhost:3000](http://localhost:3000),完成初始化向导设置管理员账号。


## 📄 许可证

MIT License
