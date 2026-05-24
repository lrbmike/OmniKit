#!/bin/sh
set -e

echo "Setting up OmniKit..."

DATABASE_PROVIDER="${DATABASE_PROVIDER:-sqlite}"
PRISMA_SCHEMA="/app/prisma/schema.prisma"

case "$DATABASE_PROVIDER" in
  sqlite)
    export DATABASE_URL="${DATABASE_URL:-file:/app/data/omnikit.db}"

    # 确保 SQLite 数据目录存在
    mkdir -p /app/data

    # 如果数据库文件不存在，创建一个空文件
    if [ ! -f /app/data/omnikit.db ]; then
      echo "Creating database file..."
      touch /app/data/omnikit.db
      echo "Database file created"
    fi

    # 设置数据目录权限，确保 nextjs 用户可以访问
    chown -R nextjs:nodejs /app/data
    find /app/data -type d -exec chmod 755 {} \;
    find /app/data -type f -exec chmod 664 {} \;
    ;;
  postgresql)
    PRISMA_SCHEMA="/app/prisma/schema.postgresql.prisma"

    if [ -z "$DATABASE_URL" ]; then
      echo "DATABASE_URL must be set when DATABASE_PROVIDER=postgresql"
      exit 1
    fi
    ;;
  *)
    echo "Unsupported DATABASE_PROVIDER: $DATABASE_PROVIDER"
    exit 1
    ;;
esac

echo "Using database provider: $DATABASE_PROVIDER"
echo "Generating Prisma Client..."
node /app/node_modules/prisma/build/index.js generate --schema "$PRISMA_SCHEMA"
echo "Prisma Client generated"

# 每次启动都应用迁移；只在空库时写入预置数据，避免重启覆盖用户菜单。
if [ "$DATABASE_PROVIDER" = "sqlite" ]; then
  echo "Applying SQLite migrations..."
  node /app/node_modules/prisma/build/index.js migrate deploy --schema "$PRISMA_SCHEMA"
  echo "SQLite migrations applied"
else
  echo "Syncing PostgreSQL schema..."
  node /app/node_modules/prisma/build/index.js db push --skip-generate --schema "$PRISMA_SCHEMA"
  echo "PostgreSQL schema synced"
fi

TOOL_COUNT=$(node --input-type=module <<'NODE'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const count = await prisma.tool.count();
  console.log(count);
} catch {
  console.log(0);
} finally {
  await prisma.$disconnect();
}
NODE
)

if [ "$TOOL_COUNT" = "0" ]; then
  echo "Seeding database..."
  node prisma/seed.js
  echo "Database seeded"
else
  echo "Database already contains preset data, skipping seed"
fi

echo "Starting application as nextjs user..."

# 切换到 nextjs 用户并启动应用
# 容器使用 standalone 构建，server.js 在根目录
exec su-exec nextjs:nodejs node server.js
