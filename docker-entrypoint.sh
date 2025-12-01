#!/bin/sh
set -e

echo "Setting up OmniKit..."

# 确保数据目录存在
mkdir -p /app/data

# 如果数据库文件不存在，创建一个空文件
if [ ! -f /app/data/omnikit.db ]; then
  echo "Creating database file..."
  touch /app/data/omnikit.db
  chmod 666 /app/data/omnikit.db
  echo "Database file created"
fi

# 设置数据目录权限，确保 nextjs 用户可以访问
chown -R nextjs:nodejs /app/data
chmod -R 755 /app/data

echo "Starting application as nextjs user..."

# 切换到 nextjs 用户并启动应用
exec su-exec nextjs:nodejs node server.js
