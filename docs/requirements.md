# OmniKit 多工具管理后台 - 需求文档

> **文档版本:** 1.0  
> **创建日期:** 2025-11-27  
> **最后更新:** 2025-11-27

---

## 📋 项目概述

OmniKit 是一个基于 Next.js 15 的轻量级多工具集合管理后台系统，支持自定义菜单编排、多数据库配置、国际化，并可通过 Docker 部署到 Render 等平台。

---

## 🎯 核心需求

### 1. 系统架构

#### 1.1 技术栈
- **前端框架:** Next.js 15 + React 19
- **样式方案:** Tailwind CSS + ShadcnUI
- **状态管理:** Zustand
- **国际化:** next-intl (中文/英文)
- **数据库 ORM:** Prisma
- **认证:** Session-based (bcrypt + JWT)

#### 1.2 部署要求
- ✅ 单端口部署（前后端共用端口 3000）
- ✅ 轻量级 Docker 镜像
- ✅ 支持 Render 等云平台部署
- ✅ 无需独立后端服务（使用 Next.js API Routes + Server Actions）

#### 1.3 数据库支持
- **默认数据库:** SQLite (better-sqlite3)
- **可选数据库:** MySQL, PostgreSQL
- **切换方式:** 通过后台配置界面
- **连接测试:** 切换前必须通过连接测试
- **数据迁移:** 支持从 SQLite 同步到 MySQL/PostgreSQL（后续功能）

---

### 2. 认证系统

#### 2.1 首次初始化流程
1. **检测初始化状态** - 系统启动时检查是否已有管理员账号
2. **初始化向导** - 如果未初始化，引导用户完成设置：
   - **步骤 1:** 语言选择（默认中文，可切换英文）
   - **步骤 2:** 数据库配置（SQLite/MySQL/PostgreSQL + 连接测试）
   - **步骤 3:** 创建管理员账号（邮箱 + 密码）
3. **完成初始化** - 自动初始化工具库和默认菜单结构

#### 2.2 登录与会话管理
- **登录方式:** 邮箱 + 密码
- **密码加密:** bcrypt
- **会话存储:** 加密 Cookie (httpOnly)
- **会话过期:** 默认 7 天，可在设置中配置
- **会话持久化:** 同一设备无需重复登录（直到过期）

#### 2.3 用户模式
- **当前阶段:** 单管理员模式
- **未来扩展:** 数据库已预留 `userId` 字段，支持多用户扩展

---

### 3. 界面设计

#### 3.1 主题风格
- **色彩方案:** 黑白灰为主
- **设计风格:** 现代简洁的管理后台风格
- **响应式:** 支持桌面和移动端

#### 3.2 布局结构
```
┌─────────────────────────────────────────────┐
│  Header (用户信息 | 语言切换 | 退出登录)      │
├──────────┬──────────────────────────────────┤
│          │                                  │
│  Sidebar │  Main Content Area               │
│          │                                  │
│  多级菜单 │  工具页面 / 设置页面 / 仪表盘     │
│          │                                  │
│  (可折叠) │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

#### 3.3 侧边栏菜单
- **多层级支持:** 无限层级嵌套（文件夹 + 工具项）
- **图标显示:** 使用 Lucide React 图标
- **当前路由高亮**
- **折叠/展开功能**
- **搜索过滤:** 实时搜索已编排的工具

---

### 4. 工具库系统

#### 4.1 预置工具清单（18 个工具）

##### 开发工具 (Developer Tools) - 7 个
| 工具名称 | 英文名称 | 图标 | 组件路径 |
|---------|---------|------|---------|
| JSON 格式化 | JSON Formatter | `Braces` | `json-formatter` |
| Base64 编解码 | Base64 Encoder | `Binary` | `base64-encoder` |
| URL 编解码 | URL Encoder | `Link` | `url-encoder` |
| Markdown 预览 | Markdown Preview | `FileText` | `markdown-preview` |
| 正则表达式测试 | Regex Tester | `Search` | `regex-tester` |
| 时间戳转换 | Timestamp Converter | `Clock` | `timestamp-converter` |
| UUID 生成器 | UUID Generator | `Hash` | `uuid-generator` |

##### 安全工具 (Security Tools) - 3 个
| 工具名称 | 英文名称 | 图标 | 组件路径 |
|---------|---------|------|---------|
| 密码生成器 | Password Generator | `Key` | `password-generator` |
| Hash 计算 | Hash Calculator | `Shield` | `hash-calculator` |
| JWT 解析 | JWT Decoder | `Lock` | `jwt-decoder` |

##### 颜色工具 (Color Tools) - 3 个
| 工具名称 | 英文名称 | 图标 | 组件路径 |
|---------|---------|------|---------|
| 颜色选择器 | Color Picker | `Palette` | `color-picker` |
| 渐变生成器 | Gradient Generator | `Droplet` | `gradient-generator` |
| 颜色对比检测 | Contrast Checker | `Eye` | `contrast-checker` |

##### 图像工具 (Image Tools) - 3 个
| 工具名称 | 英文名称 | 图标 | 组件路径 |
|---------|---------|------|---------|
| 二维码生成器 | QR Code Generator | `QrCode` | `qr-code-generator` |
| 图片压缩 | Image Compressor | `ImageDown` | `image-compressor` |
| Base64 图片转换 | Image to Base64 | `Image` | `image-to-base64` |

##### 文本工具 (Text Tools) - 2 个
| 工具名称 | 英文名称 | 图标 | 组件路径 |
|---------|---------|------|---------|
| 文本差异对比 | Text Diff | `FileSearch` | `text-diff` |
| 字数统计 | Word Counter | `Type` | `word-counter` |

#### 4.2 默认菜单结构

初始化后自动创建的菜单：

```
📁 开发工具 (Developer Tools)
  ├─ JSON 格式化
  ├─ Base64 编解码
  ├─ URL 编解码
  ├─ Markdown 预览
  └─ 时间戳转换

📁 安全工具 (Security Tools)
  ├─ 密码生成器
  ├─ Hash 计算
  └─ JWT 解析

📁 颜色工具 (Color Tools)
  ├─ 颜色选择器
  ├─ 渐变生成器
  └─ 颜色对比检测

📁 图像工具 (Image Tools)
  ├─ 二维码生成器
  ├─ 图片压缩
  └─ Base64 图片转换

📁 文本工具 (Text Tools)
  ├─ 文本差异对比
  └─ 字数统计

🔧 正则表达式测试 (顶级菜单)
🔧 UUID 生成器 (顶级菜单)
```

---

### 5. 菜单编排系统

#### 5.1 菜单编辑器（MVP 版本）

**功能特性:**
- ✅ 列表视图显示菜单层级（缩进表示层级）
- ✅ 上移/下移按钮调整顺序
- ✅ 删除菜单项（不删除工具本身）
- ✅ 创建文件夹（支持多层级分组）
- ✅ 从工具库添加工具
- ✅ 重命名菜单项（自定义显示名称）
- ✅ 实时预览菜单结构

**页面位置:** `/admin/settings/menu`

#### 5.2 工具库浏览

**功能特性:**
- 按分类展示所有可用工具
- 工具卡片显示：图标、名称、描述
- 搜索和筛选功能
- "添加到菜单" 按钮

**页面位置:** `/admin/tools/library`

#### 5.3 工具搜索

**首页搜索框:**
- 全局搜索已编排的工具
- 快捷键支持 (`Ctrl+K` / `Cmd+K`)
- 搜索结果高亮匹配文字

**侧边栏搜索:**
- 实时过滤菜单项
- 扁平化显示匹配结果

---

### 6. 核心页面

#### 6.1 仪表盘 (`/admin/dashboard`)
- 系统状态概览
- 快捷访问常用工具
- 最近使用工具
- 工具分类卡片展示

#### 6.2 设置页面 (`/admin/settings`)

**子页面:**
- **菜单管理** (`/admin/settings/menu`) - 编排菜单结构
- **数据库配置** (`/admin/settings/database`) - 切换数据库、测试连接
- **系统设置** (`/admin/settings/system`) - 会话超时、语言偏好
- **用户资料** (`/admin/settings/profile`) - 修改管理员信息

#### 6.3 工具页面 (`/admin/tools/[component]`)
- 动态路由渲染工具组件
- 统一的工具页面布局
- 工具标题和描述
- 工具功能区

---

### 7. 国际化

#### 7.1 支持语言
- **中文 (zh)** - 默认语言
- **英文 (en)**

#### 7.2 语言切换
- 初始化向导第一步可选择语言
- Header 中提供语言切换器
- 语言偏好保存到数据库

#### 7.3 翻译范围
- 所有 UI 文本
- 工具名称和描述
- 菜单标签
- 错误提示和验证消息

---

### 8. 数据库设计

#### 8.1 核心表结构

**SystemConfig** - 系统配置
- 初始化状态
- 默认语言
- 数据库类型和连接信息
- 会话超时设置

**User** - 用户表
- 管理员账号信息
- 密码（bcrypt 加密）
- 角色（预留多角色支持）

**Tool** - 工具库
- 工具基本信息（中英文名称、描述）
- 图标、分类、组件路径
- 是否为预置工具
- 启用状态

**MenuItem** - 菜单项
- 用户 ID（预留多用户支持，当前使用 `default-admin`）
- 父菜单 ID（支持多层级）
- 关联工具 ID
- 自定义标签和图标
- 排序字段
- 是否为文件夹

---

### 9. 实施优先级

#### 9.1 Phase 1 - 核心工具（优先实现）
1. 密码生成器 (Password Generator)
2. JSON 格式化 (JSON Formatter)
3. 二维码生成器 (QR Code Generator)
4. 颜色选择器 (Color Picker)
5. Base64 编解码 (Base64 Encoder)
6. Hash 计算 (Hash Calculator)

#### 9.2 Phase 2 - 其余工具（后续迭代）
剩余 12 个工具将在核心功能完成后逐步实现。

---

### 10. 未来扩展计划

#### 10.1 多用户支持
- 用户注册/邀请功能
- 每个用户独立的菜单配置
- 角色权限管理

#### 10.2 自定义工具
- 用户创建自定义工具
- 外部链接工具
- iframe 嵌入工具

#### 10.3 数据同步
- SQLite → MySQL/PostgreSQL 数据迁移工具
- 自动备份功能

#### 10.4 高级菜单编辑
- 拖拽排序（@dnd-kit/core）
- 可视化菜单树编辑器

---

## ✅ 已确认决策

| 决策项 | 确认方案 |
|--------|---------|
| **后端架构** | 使用 Next.js 15，无需独立后端服务 |
| **数据库默认** | SQLite，支持切换到 MySQL/PostgreSQL |
| **认证方式** | 首次初始化创建管理员，Session-based 认证 |
| **国际化** | 中文（默认）+ 英文 |
| **菜单编辑器** | MVP 版本（列表编辑，上移/下移/删除） |
| **多用户支持** | 数据库预留设计，现阶段不实现 |
| **工具数量** | 18 个预置工具，优先实现 6 个核心工具 |
| **主题风格** | 黑白灰色系 |
| **部署方式** | Docker 单容器，单端口部署 |

---

## 📝 待确认事项

- [ ] 18 个工具清单是否需要调整？
- [ ] 优先实现 6 个核心工具的方案是否同意？
- [ ] 多用户支持"预留设计，暂不实现"的方案是否同意？

---

## 📚 相关文档

- [实施计划](file:///D:/Users/lrbmike/.gemini/antigravity/brain/ade7e7ec-2940-44ef-9bdb-ef1161cc2241/implementation_plan.md)
- [任务清单](file:///D:/Users/lrbmike/.gemini/antigravity/brain/ade7e7ec-2940-44ef-9bdb-ef1161cc2241/task.md)
- [项目 README](file:///f:/workspaces/mine/github/OmniKit/README.md)
