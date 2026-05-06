# =============================================================================
# 太陽能儲能 WebSocket 服務 - Dockerfile
# 策略：本地建置後只複製成品，避免容器內 RUN 指令
# =============================================================================

FROM node:20-alpine

WORKDIR /app

# 複製本地已建置好的成品
COPY node_modules ./node_modules
COPY dist ./dist
COPY package.json ./

# 暴露 WebSocket 端口
EXPOSE 8001

# 啟動應用
CMD ["node", "dist/main.js"]
