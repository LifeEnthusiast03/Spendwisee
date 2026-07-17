#!/bin/sh
set -e

echo "⏳ Running database migrations against cloud DB..."
npx prisma migrate deploy
echo "✅ Migrations applied"

echo "🚀 Starting Spendwise backend..."
exec node dist/index.js
