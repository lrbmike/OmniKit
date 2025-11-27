# OmniKit 依赖安装清单

## 已安装的依赖 ✅

### 生产依赖
- `prisma` - Prisma CLI 工具
- `@prisma/client` - Prisma 客户端
- `bcryptjs` - 密码加密
- `zod` - 数据验证
- `better-sqlite3` - SQLite 数据库驱动

### 开发依赖
- `@types/bcryptjs` - bcryptjs 类型定义
- `@types/better-sqlite3` - better-sqlite3 类型定义

---

## 需要额外安装的依赖 📦

### 生产依赖

```bash
pnpm add iron-session qrcode uuid
```

**说明：**
- `iron-session` - 加密的 session 管理（用于认证）
- `qrcode` - 二维码生成（二维码生成器工具）
- `uuid` - UUID 生成（UUID 生成器工具）

### 开发依赖

```bash
pnpm add -D @types/qrcode @types/uuid
```

**说明：**
- `@types/qrcode` - qrcode 类型定义
- `@types/uuid` - uuid 类型定义

---

## 完整安装命令（一次性安装所有）

```bash
# 如果之前的依赖安装成功，只需运行这个命令
pnpm add iron-session qrcode uuid

# 开发依赖
pnpm add -D @types/qrcode @types/uuid
```

---

## Prisma 初始化问题

由于网络问题，Prisma 引擎下载失败。您可以尝试以下方法：

### 方法 1: 手动创建配置（推荐）
我会直接创建 `prisma/schema.prisma` 文件，然后运行：
```bash
npx prisma generate
```

### 方法 2: 使用代理
如果有代理，可以设置环境变量：
```bash
set HTTP_PROXY=http://your-proxy:port
set HTTPS_PROXY=http://your-proxy:port
npx prisma init --datasource-provider sqlite
```

### 方法 3: 离线安装
下载预编译的 Prisma 引擎后手动放置。

---

## Prisma 构建脚本批准 ⚙️

### 已安装的 Prisma 依赖（全部完成）
- ✅ `prisma` - CLI 工具
- ✅ `@prisma/client` - 数据库客户端  
- ✅ `better-sqlite3` - SQLite 驱动
- ✅ `@prisma/engines` - Prisma 引擎（自动包含）

### 批准构建脚本

运行 `pnpm approve-builds` 后会出现交互式选择界面：

```
? Choose which packages to build
  ❯ ○ @prisma/engines
    ○ better-sqlite3
    ○ prisma
```

**操作步骤：**
1. 按 **`a`** 键（toggle all）全选所有包
2. 按 **`Enter`** 键确认

**或者跳过批准：**
- 按 `Ctrl+C` 取消
- 直接创建 Prisma 配置文件
- 首次运行 `prisma generate` 时会自动下载引擎

---

## 安装完成后请告诉我

安装完成后，我会继续创建：
1. Prisma schema 文件
2. 数据库配置文件
3. 工具库种子数据
4. 认证系统

请运行上面的安装命令，完成后告诉我继续！
