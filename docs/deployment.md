# OmniKit Docker 部署指南

> **文档版本:** 1.0  
> **创建日期:** 2025-11-30

---

## 📋 部署概述

OmniKit 支持通过 Docker 进行轻量级部署，适用于以下平台：
- **本地开发环境**
- **VPS 服务器** (任何支持 Docker 的服务器)
- **Render.com**
- **Railway.app**
- **Fly.io**
- 其他支持 Docker 的云平台

---

## 🚀 快速开始

### 方式一：使用 Docker Compose (推荐)

这是最简单的部署方式，适合本地开发和生产环境。

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/omnikit.git
cd omnikit

# 2. 构建并启动容器
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 访问应用
# 浏览器打开 http://localhost:3000
```

**停止服务:**
```bash
docker-compose down
```

**停止并删除数据卷:**
```bash
docker-compose down -v
```

---

### 方式二：使用 Docker 命令

如果你不想使用 docker-compose，可以直接使用 Docker 命令。

```bash
# 1. 构建镜像
docker build -t omnikit:latest .

# 2. 创建数据卷
docker volume create omnikit-data

# 3. 运行容器
docker run -d \
  --name omnikit \
  -p 3000:3000 \
  -v omnikit-data:/app/data \
  -e NODE_ENV=production \
  --restart unless-stopped \
  omnikit:latest

# 4. 查看日志
docker logs -f omnikit

# 5. 访问应用
# 浏览器打开 http://localhost:3000
```

---

## 🌐 部署到云平台

### Render.com 部署

Render 提供免费的 Docker 应用托管服务。

**步骤:**

1. **在 Render 创建 Web Service**
   - 连接你的 GitHub 仓库
   - 选择 "Docker" 作为环境

2. **配置设置**
   - **Name:** `omnikit`
   - **Region:** 选择最近的区域
   - **Branch:** `main`
   - **Dockerfile Path:** `Dockerfile`
   - **Docker Command:** 留空，使用镜像内置入口脚本

3. **添加环境变量**
   ```
   NODE_ENV=production
   SESSION_SECRET=请替换为至少 32 位的随机字符串
   # DATABASE_URL 可选，默认使用 /app/data/omnikit.db
   ```

4. **配置持久化存储**
   - 添加 Disk:
     - **Name:** `omnikit-data`
     - **Mount Path:** `/app/data`
     - **Size:** 1 GB (免费套餐)

5. **部署**
   - 点击 "Create Web Service"
   - 等待构建和部署完成

### Railway.app 部署

Railway 支持从 GitHub 仓库直接部署。

**步骤:**

1. **创建新项目**
   - 在 Railway 仪表盘点击 "New Project"
   - 选择 "Deploy from GitHub repo"

2. **配置服务**
   - Railway 会自动检测 Dockerfile
   - 添加环境变量：
     ```
     NODE_ENV=production
     SESSION_SECRET=请替换为至少 32 位的随机字符串
     # DATABASE_URL 可选，默认使用 /app/data/omnikit.db
     ```

3. **配置持久化存储**
   - 添加 Volume:
     - **Mount Path:** `/app/data`

4. **生成域名**
   - Railway 会自动分配一个域名
   - 或者配置自定义域名

---

## 🔧 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `NODE_ENV` | 运行环境 | `production` | `production` |
| `SESSION_SECRET` | 会话加密密钥，至少 32 位随机字符串 | 无 | `openssl rand -base64 32` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `DATABASE_URL` | 数据库连接字符串 | `file:/app/data/omnikit.db` | `file:/app/data/omnikit.db` |
| `PORT` | 应用端口 | `3000` | `3000` |
| `HOSTNAME` | 监听地址 | `0.0.0.0` | `0.0.0.0` |
| `ENABLE_SECURE_COOKIE` | HTTPS 部署时开启安全 Cookie | `false` | `true` |

---

## 💾 数据持久化

### 重要说明

OmniKit 使用 SQLite 数据库存储所有数据（用户、工具、菜单等）。为了防止数据丢失，**必须**配置持久化存储。

容器内的数据库路径：`/app/data/omnikit.db`

### 方式一：使用 Docker 命名卷（推荐）

Docker 自动管理的数据卷，数据存储在 Docker 的内部目录中。

**Docker Compose:**
```yaml
volumes:
  - omnikit-data:/app/data
```

**Docker 命令:**
```bash
# 创建命名卷
docker volume create omnikit-data

# 运行容器时挂载
docker run -d \
  --name omnikit \
  -p 3000:3000 \
  -v omnikit-data:/app/data \
  omnikit:latest
```

**优点：**
- Docker 自动管理，不需要手动创建目录
- 跨平台兼容性好
- 支持 Docker 的备份和迁移工具

**查看数据卷位置：**
```bash
docker volume inspect omnikit-data
```

### 方式二：挂载主机目录（更灵活）

直接映射主机上的目录到容器内，方便直接访问和备份数据库文件。

**Docker Compose:**

修改 `docker-compose.yml`：
```yaml
services:
  omnikit:
    volumes:
      # 使用主机目录（推荐使用绝对路径）
      - ./data:/app/data
      # 或者使用其他路径，例如：
      # - /var/omnikit/data:/app/data
      # - D:/docker/omnikit/data:/app/data  # Windows
```

**Docker 命令:**
```bash
# Linux/Mac - 使用相对路径
docker run -d \
  --name omnikit \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  omnikit:latest

# Linux/Mac - 使用绝对路径
docker run -d \
  --name omnikit \
  -p 3000:3000 \
  -v /path/to/your/data:/app/data \
  omnikit:latest

# Windows (PowerShell)
docker run -d \
  --name omnikit \
  -p 3000:3000 \
  -v ${PWD}/data:/app/data \
  omnikit:latest

# Windows (CMD) - 使用绝对路径
docker run -d ^
  --name omnikit ^
  -p 3000:3000 ^
  -v D:\docker\omnikit\data:/app/data ^
  omnikit:latest
```

**优点：**
- 数据库文件直接在主机目录中可见
- 方便直接备份、复制数据库文件
- 便于使用数据库管理工具直接访问
- 易于在不同容器间共享数据

**注意事项：**
1. 主机目录必须存在（Docker 会自动创建，但建议手动创建）
2. 确保目录有正确的权限（容器内使用 UID 1001）
3. Windows 路径使用 `/` 分隔符

**创建并设置权限（Linux/Mac）：**
```bash
# 创建数据目录
mkdir -p ./data

# 设置权限（如果需要）
chmod 755 ./data
```

### 方式三：云平台持久化

- **Render:** 添加 Disk，挂载到 `/app/data`
- **Railway:** 添加 Volume，挂载到 `/app/data`
- **Fly.io:** 配置 Persistent Volume

### 数据库文件说明

成功运行后，在挂载的目录中会看到：
```
data/
├── omnikit.db          # SQLite 数据库文件
└── omnikit.db-journal  # SQLite 日志文件（可能存在）
```

你可以直接：
- 复制 `omnikit.db` 文件进行备份
- 使用 SQLite 客户端工具打开数据库
- 将数据库文件移到其他地方

---

## 🔄 更新和维护

### 更新应用

**使用 Docker Compose:**

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 查看日志确认启动成功
docker-compose logs -f
```

**使用 Docker 命令:**

```bash
# 1. 停止旧容器
docker stop omnikit

# 2. 删除旧容器
docker rm omnikit

# 3. 重新构建镜像
docker build -t omnikit:latest .

# 4. 启动新容器
docker run -d \
  --name omnikit \
  -p 3000:3000 \
  -v omnikit-data:/app/data \
  -e NODE_ENV=production \
  --restart unless-stopped \
  omnikit:latest
```

### 备份数据

**导出数据库:**

```bash
# 使用 Docker Compose
docker-compose exec omnikit cp /app/data/omnikit.db /app/data/omnikit.db.backup

# 复制到主机
docker cp omnikit:/app/data/omnikit.db.backup ./backup/

# 使用 Docker 命令
docker exec omnikit cp /app/data/omnikit.db /app/data/omnikit.db.backup
docker cp omnikit:/app/data/omnikit.db.backup ./backup/
```

### 恢复数据

```bash
# 复制备份到容器
docker cp ./backup/omnikit.db.backup omnikit:/app/data/

# 恢复数据库
docker exec omnikit cp /app/data/omnikit.db.backup /app/data/omnikit.db

# 重启容器
docker restart omnikit
```

---

## 🔍 故障排查

### 查看日志

```bash
# Docker Compose
docker-compose logs -f

# Docker 命令
docker logs -f omnikit
```

### 进入容器调试

```bash
# Docker Compose
docker-compose exec omnikit sh

# Docker 命令
docker exec -it omnikit sh
```

### 常见问题

**1. 容器启动失败**

- 检查端口 3000 是否被占用
- 查看日志：`docker logs omnikit`
- 确认数据卷挂载正确

**2. 数据丢失**

- 确认已配置持久化存储
- 检查数据卷是否正确挂载：`docker volume ls`
- 验证数据卷内容：`docker exec omnikit ls -la /app/data`

**3. 数据库错误**

- 检查 `DATABASE_URL` 环境变量
- 确认 `/app/data` 目录有写入权限
- 尝试删除数据库文件并重新初始化

**4. 构建失败**

- 确认已安装 Docker 和 Docker Compose
- 检查网络连接（需要下载依赖）
- 清理 Docker 缓存：`docker builder prune`

---

## 📊 性能优化

### 镜像大小优化

当前 Dockerfile 已使用多阶段构建，生成的镜像约 **150-200 MB**。

### 内存使用

- 最小内存要求：**256 MB**
- 推荐内存：**512 MB**
- 生产环境：**1 GB**

### 数据库性能

SQLite 适合轻量级应用（< 1000 用户）。如需更高性能，可在应用设置中切换到 MySQL 或 PostgreSQL。

---

## 🔒 安全建议

1. **使用 HTTPS**
   - 在生产环境使用反向代理（Nginx/Caddy）
   - 配置 SSL 证书（Let's Encrypt）

2. **限制访问**
   - 使用防火墙限制端口访问
   - 配置云平台的安全组规则

3. **定期备份**
   - 设置自动备份计划
   - 将备份存储在异地

4. **更新维护**
   - 定期更新应用版本
   - 关注安全补丁

---

## 📞 获取帮助

- **GitHub Issues:** [提交问题](https://github.com/yourusername/omnikit/issues)
- **文档:** [查看文档](https://github.com/yourusername/omnikit/tree/main/docs)

---

## 📝 附录

### 完整的 docker-compose.yml

```yaml
version: '3.8'

services:
  omnikit:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: omnikit
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - omnikit-data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  omnikit-data:
    driver: local
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
