# =============================================================================
# 太陽能儲能 API 後端 - Dockerfile (NestJS)
# Solar Energy Storage Management System - API Backend
# =============================================================================

# 使用 Node.js LTS 版本作為基礎映像
FROM node:20-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安裝依賴（包含開發依賴以進行編譯）
RUN npm ci && \
    npm cache clean --force

# 複製原始碼並編譯 TypeScript
COPY . .
RUN npm run build || true

# =============================================================================
# 生產環境映像（最小化）
# =============================================================================
FROM node:20-alpine

# 安裝 PostgreSQL 客戶端（TypeORM 需要）
RUN apk add --no-cache postgresql-client

WORKDIR /app

# 從 builder 複製生產依賴和編譯後的檔案
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist

# 建立非 root 使用者運行應用
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 切換到非 root 使用者
USER appuser

# 暴露 API 端口
EXPOSE 8000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

# 啟動應用
CMD ["node", "dist/main.js"]
