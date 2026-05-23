#!/bin/sh
set -eu

DB_URL="file:../data/omnikit.db"
DB_FILE="data/omnikit.db"

mkdir -p data

if [ ! -s "$DB_FILE" ]; then
  echo "Bootstrapping local SQLite database..."

  for migration in prisma/migrations/*/migration.sql; do
    DATABASE_URL="$DB_URL" pnpm prisma db execute --file "$migration" --schema prisma/schema.prisma
  done

  DATABASE_URL="$DB_URL" pnpm prisma db seed
fi

DATABASE_URL="$DB_URL" next dev --turbopack
