# OmniKit 依赖清单

## ✅ 已安装的核心依赖

### 生产依赖 (Dependencies)
- **框架**: `next`, `react`, `react-dom`
- **数据库**: `prisma`, `@prisma/client`, `better-sqlite3`
- **认证**: `iron-session`, `bcryptjs`
- **UI/样式**: `tailwindcss`, `postcss`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
- **国际化**: `next-intl`
- **状态管理**: `zustand`
- **表单校验**: `zod`
- **通知**: `sonner`

### 工具库依赖 (按工具分类)

#### 通用/核心
- **uuid**: 生成 UUID (用于 `UuidGenerator`)
- **qrcode**: 生成二维码 (用于 `QrCodeGenerator`)
- **crypto-js**: 加密算法 (用于 `HashCalculator`, `Base64Encoder`)

#### 开发工具
- **react-markdown**: Markdown 渲染 (用于 `MarkdownPreview`)
- **date-fns**: 日期时间处理 (用于 `TimestampConverter`)

#### 安全工具
- **jwt-decode**: JWT 解析 (用于 `JwtDecoder`)

#### 图像工具
- **browser-image-compression**: 图片压缩 (用于 `ImageCompressor`)

#### 文本工具
- **diff**: 文本差异对比 (用于 `TextDiff`)

### 开发依赖 (DevDependencies)
- `@types/node`, `@types/react`, `@types/react-dom`
- `typescript`
- `eslint`, `eslint-config-next`
- `@tailwindcss/postcss`
- `@types/bcryptjs`
- `@types/better-sqlite3`
- `@types/uuid`
- `@types/qrcode`
- `@types/crypto-js`
- `@types/diff`

---

## 📦 安装命令参考

如果需要重新安装所有依赖：

```bash
pnpm install
```

单独安装工具库依赖：

```bash
pnpm add uuid qrcode crypto-js react-markdown date-fns jwt-decode browser-image-compression diff
pnpm add -D @types/uuid @types/qrcode @types/crypto-js @types/diff
