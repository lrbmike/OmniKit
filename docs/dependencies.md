# OmniKit 依赖清单

> **文档版本:** 1.1  
> **最后更新:** 2025-11-30

---

## ✅ 已安装的核心依赖

### 生产依赖 (Dependencies)

#### 框架和核心
- **next** (^15.0.0) - Next.js 框架
- **react** (^19.0.0) - React 框架
- **react-dom** (^19.0.0) - React DOM 渲染

#### 数据库
- **prisma** - Prisma ORM
- **@prisma/client** - Prisma 客户端
- **better-sqlite3** - SQLite 数据库驱动

#### 认证与安全
- **iron-session** - Session 管理
- **bcryptjs** - 密码加密
- **@types/bcryptjs** - bcryptjs 类型定义

#### UI 组件和样式
- **tailwindcss** - Tailwind CSS 框架
- **postcss** - CSS 后处理器
- **@tailwindcss/postcss** - Tailwind PostCSS 插件
- **lucide-react** - 图标库
- **clsx** - 类名工具
- **tailwind-merge** - Tailwind 类名合并
- **class-variance-authority** - 组件变体管理
- **@radix-ui/react-*** - Radix UI 组件集
  - `@radix-ui/react-hover-card` - 悬浮卡片
  - `@radix-ui/react-switch` - 开关组件
  - `@radix-ui/react-dialog` - 对话框
  - `@radix-ui/react-dropdown-menu` - 下拉菜单
  - `@radix-ui/react-label` - 标签
  - `@radix-ui/react-select` - 选择器
  - `@radix-ui/react-separator` - 分隔线
  - `@radix-ui/react-slider` - 滑块
  - `@radix-ui/react-slot` - 插槽

#### 国际化
- **next-intl** - Next.js 国际化解决方案

#### 状态管理
- **zustand** - 轻量级状态管理

#### 表单和验证
- **zod** - Schema 验证库

#### 通知
- **sonner** - Toast 通知组件

---

### 工具库依赖 (按工具分类)

#### 通用/核心
- **uuid** - 生成 UUID
  - 用于：`UUID Generator`
- **qrcode** - 生成二维码
  - 用于：`QR Code Generator`
- **crypto-js** - 加密算法库
  - 用于：`Hash Calculator`, `Base64 Encoder`

#### 开发工具
- **react-markdown** - Markdown 渲染
  - 用于：`Markdown Preview`
- **date-fns** - 日期时间处理
  - 用于：`Timestamp Converter`

#### 安全工具
- **jwt-decode** - JWT Token 解析
  - 用于：`JWT Decoder`

#### 图像工具
- **browser-image-compression** - 浏览器端图片压缩
  - 用于：`Image Compressor`

#### 文本工具
- **diff** - 文本差异对比算法
  - 用于：`Text Diff`

#### AI 工具
*注意：AI 工具不需要额外的依赖包，通过调用 AI 提供商的 API 实现*
- **文本翻译器** - 使用配置的 AI 提供商 API
- **变量名生成器** - 使用配置的 AI 提供商 API

---

### 开发依赖 (DevDependencies)

#### TypeScript
- **typescript** (^5.x) - TypeScript 编译器
- **@types/node** - Node.js 类型定义
- **@types/react** - React 类型定义
- **@types/react-dom** - React DOM 类型定义

#### 代码质量
- **eslint** - ESLint 代码检查
- **eslint-config-next** - Next.js ESLint 配置

#### 工具库类型定义
- **@types/better-sqlite3** - better-sqlite3 类型定义
- **@types/uuid** - uuid 类型定义
- **@types/qrcode** - qrcode 类型定义
- **@types/crypto-js** - crypto-js 类型定义
- **@types/diff** - diff 类型定义

#### 数据库工具
- **tsx** - TypeScript 执行器（用于运行 Prisma seed 脚本）

---

## 📦 安装命令参考

### 完整安装
如果需要重新安装所有依赖：

```bash
pnpm install
```

### 分类安装

#### 核心框架和工具
```bash
pnpm add next react react-dom
pnpm add prisma @prisma/client better-sqlite3
pnpm add iron-session bcryptjs
pnpm add next-intl zustand zod sonner
```

#### UI 和样式
```bash
pnpm add tailwindcss postcss @tailwindcss/postcss
pnpm add lucide-react clsx tailwind-merge class-variance-authority
pnpm add @radix-ui/react-hover-card @radix-ui/react-switch @radix-ui/react-dialog
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select
pnpm add @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot
```

#### 工具库依赖
```bash
pnpm add uuid qrcode crypto-js react-markdown date-fns jwt-decode browser-image-compression diff
```

#### 开发依赖
```bash
pnpm add -D typescript @types/node @types/react @types/react-dom
pnpm add -D eslint eslint-config-next
pnpm add -D @types/bcryptjs @types/better-sqlite3 @types/uuid @types/qrcode @types/crypto-js @types/diff
pnpm add -D tsx
```

---

## 🔧 AI 提供商配置说明

AI 工具（文本翻译器、变量名生成器）需要配置 AI 提供商才能使用。

### 支持的 AI 提供商
- **OpenAI** - GPT-3.5/GPT-4 系列
- **Deepseek** - Deepseek Chat 系列
- **Ollama** - 本地部署的开源模型
- **其他兼容 OpenAI API 的提供商**

### 配置要求
1. 在 `/admin/settings/ai-providers` 页面添加 AI 提供商
2. 配置以下信息：
   - 提供商名称
   - Base URL (API 端点)
   - API Key
   - 模型名称
3. 在对应的工具设置页面选择要使用的提供商

### API 调用方式
- 使用标准的 OpenAI Chat Completions API 格式
- 通过 `fetch` 直接调用，无需额外的 SDK 依赖
- 支持自定义系统提示词

---

## 📝 依赖说明

### 为什么选择这些依赖？

1. **Next.js 15 + React 19**
   - 最新版本，性能优化
   - Server Actions 简化后端逻辑
   - 内置优化和缓存

2. **Prisma + SQLite**
   - 类型安全的 ORM
   - SQLite 适合轻量级部署
   - 支持切换到 MySQL/PostgreSQL

3. **Tailwind CSS + ShadcnUI**
   - 快速开发
   - 一致的设计系统
   - 易于自定义

4. **Zustand**
   - 比 Redux 更轻量
   - 简单直观的 API
   - 适合中小型应用

5. **next-intl**
   - Next.js 官方推荐
   - 支持 App Router
   - 完善的 TypeScript 支持

---

## 🚀 未来可能添加的依赖

- **@dnd-kit/core** - 拖拽功能（菜单编辑器增强）
- **recharts** - 数据可视化（仪表盘图表）
- **react-hook-form** - 复杂表单管理
- **@tanstack/react-query** - 数据获取和缓存
