#!/bin/sh
set -e

# 确保数据目录存在
mkdir -p /app/data

# 如果数据库文件不存在，创建一个空文件
if [ ! -f /app/data/omnikit.db ]; then
  echo "Creating database file..."
  touch /app/data/omnikit.db
  chmod 664 /app/data/omnikit.db
fi

# 启动应用
exec node server.js
