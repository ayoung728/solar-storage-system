# =============================================================================
# 太陽能儲能前端 - Dockerfile
# 策略：本地建置後只複製成品，避免容器內 RUN 指令
# =============================================================================

FROM node:20-alpine AS development

WORKDIR /app

COPY node_modules ./node_modules
COPY src ./src
COPY index.html ./
COPY package.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./

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
