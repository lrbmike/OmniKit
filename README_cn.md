# OmniKit - 多功能开发工具集

一个基于 Next.js 15 构建的强大、可扩展的管理系统，旨在通过统一的界面管理多种开发工具。

## 🚀 核心特性

- **核心框架**: Next.js 15 (App Router) + React 19
- **数据库**: SQLite (默认) + Prisma ORM
- **界面设计**: Tailwind CSS + ShadcnUI + Lucide 图标
- **身份认证**: 基于 `iron-session` 的安全会话管理
- **初始化向导**: 内置首次配置引导
- **国际化**: 通过 `next-intl` 完整支持中英文切换
- **状态管理**: Zustand
- **天气集成**: 可配置 API 的实时天气预报

## 🧰 可用工具 (21 个)

### 开发工具
- **JSON 格式化**: 格式化、压缩和验证 JSON
- **Base64 编解码**: Base64 文本编码和解码
- **URL 编解码**: URL 参数编码和解码
- **Markdown 预览**: 实时 Markdown 编辑和预览
- **正则表达式测试**: 测试正则表达式匹配
- **时间戳转换**: Unix 时间戳与日期互转
- **UUID 生成器**: 生成随机 UUID (v4)

### 安全工具
- **密码生成器**: 生成安全的随机密码
- **Hash 计算**: 计算 MD5、SHA1、SHA256 哈希值
- **JWT 解析**: 解析和检查 JSON Web Token

### 颜色工具
- **颜色选择器**: 选择和转换颜色 (HEX、RGB、HSL)
- **渐变生成器**: 创建 CSS 线性和径向渐变
- **颜色对比检测**: 检查 WCAG 颜色对比度可访问性

### 图片工具
- **二维码生成器**: 生成和下载二维码
- **图片压缩**: 压缩和优化图片
- **图片 Base64 转换**: 图片与 Base64 字符串互转

### 文本工具
- **文本差异对比**: 比较两段文本并高亮显示差异
- **字数统计**: 统计字符、单词、行数和段落数

### AI 工具
- **文本翻译**: AI 驱动的智能中英文互译
- **变量名生成器**: AI 智能生成变量名工具

### 存储工具
- **GitHub 上传**: 上传文件到 GitHub 并获取 CDN 链接 (jsDelivr)

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
   初始化 SQLite 数据库、创建表结构并填充默认工具数据：
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   > **注意：** 如果手动删除 `data/omnikit.db` 来重置系统，**必须**重新运行这些命令来初始化表和工具，然后才能启动开发服务器。

4. **运行开发服务器**
   ```bash
   pnpm dev
   ```

5. **访问系统**
   在浏览器中打开 [http://localhost:3000](http://localhost:3000)
   - 首次运行会跳转到**初始化向导** (`/init`)
   - 按照步骤设置管理员账号

## 📂 项目结构

- `src/app`: App Router 页面和布局
  - `(auth)`: 登录/注册路由
  - `(init)`: 初始化向导
  - `(admin)`: 主控制台
- `src/actions`: Server Actions (认证、初始化等)
- `src/lib`: 核心工具库 (数据库、会话、初始化检查)
- `src/components`: 可复用 UI 组件
- `src/messages`: 国际化翻译文件
- `prisma`: 数据库模型和种子数据

## 🔐 身份认证

系统使用安全的数据库支持的身份验证系统。
- **管理员账号**: 在初始化过程中创建
- **会话管理**: 加密的 HTTP-only cookies

## 🌍 国际化

内置多语言支持。
- 默认：自动检测浏览器语言
- 支持语言：英文 (`en`)、中文 (`zh`)
- 配置文件：`src/i18n/routing.ts`

## 🐳 Docker 部署

OmniKit 可以轻松通过 Docker 部署。

```bash
# 构建并启动
docker-compose up -d --build

# 停止
docker-compose down

# 查看日志
docker-compose logs -f
```

应用将运行在 [http://localhost:3000](http://localhost:3000)。

## ⚙️ 系统配置

初始化后，可以在管理面板中配置各种设置：

- **菜单管理**: 自定义侧边栏菜单结构
- **快捷工具**: 为仪表盘选择最多 4 个快捷工具
- **系统设置**: 语言、主题偏好
- **天气配置**: 配置天气 API 集成
- **AI 提供商**: 管理用于翻译和代码生成的 AI 服务提供商
  - 添加兼容 OpenAI 的 API 提供商
  - 配置 API 密钥和模型
- **翻译设置**: 配置 AI 驱动的翻译功能
  - 选择翻译使用的 AI 提供商
  - 自定义系统提示词
  - 支持中英文双向翻译
- **变量名生成器**: 配置用于代码生成的 AI
  - 选择 AI 提供商
  - 自定义生成提示词
- **GitHub 配置**: 配置 Personal Access Token 用于文件上传

## 📄 许可证

MIT License
