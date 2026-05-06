# =============================================================================
# 太陽能儲能前端 - Dockerfile
# 開發階段：容器內執行 npm install，確保 native 模組與 Alpine (musl) 相容
# 生產階段：Nginx 靜態檔案服務
# =============================================================================

FROM node:20-alpine AS development

WORKDIR /app

# 先複製依賴設定檔，利用快取加速重建
COPY package.json ./
COPY package-lock.json* ./

# 在容器內安裝依賴（確保 native 模組正確對應 Alpine 的 musl libc）
RUN npm install

# 複製原始碼與建置設定
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# =============================================================================
# 生產階段（Nginx 靜態檔案服務）
# =============================================================================
FROM nginx:alpine AS production

COPY --from=development /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
