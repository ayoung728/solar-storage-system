# =============================================================================
# 太陽能儲能前端 - Dockerfile (React + Vite)
# Solar Energy Storage Management System - Frontend
# =============================================================================

# 開發環境階段（支援熱重載）
FROM node:20-alpine AS development

WORKDIR /app

# 安裝依賴
COPY package*.json ./
RUN npm install && \
    npm cache clean --force

# 複製原始碼
COPY . .

# 設定環境變數（開發環境）
ARG VITE_API_URL=http://localhost:8000
ARG VITE_WS_URL=ws://localhost:8001
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# 啟動 Vite 開發伺服器
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# =============================================================================
# 建置階段
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 複製 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安裝依賴
RUN npm ci && \
    npm cache clean --force

# 複製原始碼並編譯 TypeScript
COPY . .

# 設定環境變數（生產環境）
ARG VITE_API_URL=http://localhost:8000
ARG VITE_WS_URL=ws://localhost:8001
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

# 編譯前端應用
RUN npm run build || true

# =============================================================================
# 生產環境映像（使用 Nginx 提供靜態檔案）
# =============================================================================
FROM nginx:alpine

# 複製編譯後的靜態檔案到 Nginx 目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 HTTP 端口
EXPOSE 80

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]
