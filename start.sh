#!/bin/bash
# =============================================================================
# 太陽能儲能監控系統 - 一鍵啟動腳本
# Solar Energy Storage Management System - Quick Start
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "☀️  太陽能儲能監控系統 - 啟動中..."
echo "========================================"

# Step 1: 確認 PostgreSQL 運行中
echo ""
echo "📦 [1/4] 檢查 PostgreSQL..."

if command -v pg_isready &>/dev/null && pg_isready -h localhost -U solar_admin &>/dev/null; then
    echo "  ✅ PostgreSQL 已就緒"
else
    echo "  ⚠️  PostgreSQL 未運行，嘗試啟動..."
    if sudo service postgresql start 2>/dev/null || sudo systemctl start postgresql 2>/dev/null; then
        sleep 2
        echo "  ✅ PostgreSQL 已啟動"
    else
        echo "  ❌ 無法啟動 PostgreSQL！"
        echo "     執行: sudo service postgresql start"
        exit 1
    fi
fi

# Step 2: 確保資料庫已初始化
echo ""
echo "🗄️  [2/4] 確認資料庫初始化..."
DB_EXISTS=$(PGPASSWORD=solar_secure_password_2024 psql -h localhost -U solar_admin -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='solar_storage'" 2>/dev/null || echo "0")
if [ "$DB_EXISTS" != "1" ]; then
    echo "  ⚠️  初始化資料庫..."
    PGPASSWORD=solar_secure_password_2024 psql -h localhost -U solar_admin -d postgres -f database/init.sql 2>/dev/null
    echo "  ✅ 資料庫已初始化"
else
    echo "  ✅ 資料庫已就緒"
fi

# Step 3: 確認建置
echo ""
echo "🔨 [3/4] 確保服務已建置..."

if [ ! -f api/dist/main.js ]; then
    echo "  ⚠️  API 未建置，編譯中..."
    cd api && npm run build && cd ..
    echo "  ✅ API 建置完成"
else
    echo "  ✅ API 已就緒"
fi

if [ ! -f websocket/dist/main.js ]; then
    echo "  ⚠️  WebSocket 未建置，編譯中..."
    cd websocket && npx tsc && cd ..
    echo "  ✅ WebSocket 建置完成"
else
    echo "  ✅ WebSocket 已就緒"
fi

cd "$SCRIPT_DIR"

# Step 4: 用 PM2 啟動所有服務
echo ""
echo "🚀 [4/4] 啟動所有服務..."

# 停止已存在的服務
pm2 delete solar-api solar-websocket solar-frontend 2>/dev/null || true

# 啟動
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "========================================"
echo "✅ 系統啟動完成！"
echo ""
echo "  📊 前端頁面   → http://localhost:3000"
echo "  🔗 API 後端   → http://localhost:8000"
echo "  🌐 WebSocket  → ws://localhost:8001"
echo ""
echo "  🔑 預設登入：admin / admin123"
echo ""
echo "  查看狀態：pm2 status"
echo "  查看日誌：pm2 logs"
echo "  停止服務：pm2 stop all"
echo "========================================"
