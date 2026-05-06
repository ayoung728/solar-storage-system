# 太陽能儲能監控系統 ☀️🔋

> Solar Storage Monitoring System — 整合設備監控、告警管理、工單追蹤與維護排程的一站式管理平台

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 📖 目錄

- [系統概述](#-系統概述)
- [需求分析摘要](#-需求分析摘要)
- [系統架構](#-系統架構)
- [功能模組](#-功能模組)
- [快速開始](#-快速開始)
- [技術棧](#-技術棧)
- [專案結構](#-專案結構)
- [API 端點](#-api-端點)

---

## 🎯 系統概述

### 專案背景

隨著太陽能發電的普及，工業大型太陽能儲能系統的規模不斷擴大。為有效管理分散式電站的運維工作，本平台提供一套整合性的管理系統，涵蓋設備監控、告警通知、客服工單、維修排程等核心功能。

### 系統目標

- **集中化管理** — 整合多個電站的設備資訊與運維流程
- **快速反應** — 即時監控設備狀態，自動產生告警
- **流程標準化** — 建立標準化的客服與維修作業流程
- **數據可視化** — 提供完整的儀表板與統計報表

### 適用場景

- 🏭 工業太陽能電站運維管理
- 🏢 商業儲能系統監控
- 🔧 遠端設備故障診斷與派工
- 📊 運維團隊績效分析

---

## 📋 需求分析摘要

### 使用者角色

| 角色 | 說明 |
|------|------|
| 🎧 **客服專員 (CS)** | 受理客戶回報、建立工單、追蹤進度 |
| 🔧 **運維工程師 (OE)** | 監控設備狀態、處理告警、技術支援 |
| 🛠️ **維修技術員 (MT)** | 現場維修作業、回報維修結果 |
| 👤 **客戶/業主 (CL)** | 查看設備狀態、提交服務請求 |
| ⚙️ **系統管理員 (SA)** | 使用者管理、系統設定、權限控管 |

### 核心業務流程

```
客戶回報 → 客服建立工單 → 分派工程師 → 技術人員處理 → 回報完成 → 客服確認關單
```

### 資料庫模型

| 實體 | 主要欄位 | 說明 |
|------|----------|------|
| `users` | id, username, password_hash, role, email | 系統使用者帳號 |
|| `devices` | id, name, device_type, status, location, specifications (JSONB), telemetry_data (JSONB), last_seen | 太陽能相關設備 |
|| `alerts` | id, device_id, severity, message, status, acknowledged_by, resolved_at | 設備異常告警記錄 |
|| `tickets` | id, device_id, title, priority, status, assigned_to, created_by, resolved_at | 客服/維修工單 |
|| `maintenance` | id, device_id, title, description, scheduled_date, completed_date, status, technician, cost | 維護排程與紀錄 |

---

## 🏗️ 系統架構

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Nginx Proxy │────▶│  NestJS API │
│  React+Vite │     │  :80/:8000   │     │   :3000     │
└─────────────┘     └──────────────┘     └──────┬──────┘
       │                                         │
       │                                ┌────────▼──────┐
       └────────────────────────────────▶│  PostgreSQL   │
        WebSocket :8001                  │   :5432       │
         Socket.IO                       └───────────────┘
```

### 服務說明

| 服務 | 技術 | 端口 | 說明 |
|------|------|:----:|------|
| **API 後端** | NestJS + TypeORM | 8000 | RESTful API、JWT 認證、資料庫操作 |
| **WebSocket** | Socket.IO | 8001 | 即時設備數據推送 |
| **前端** | React + Vite | 5173 | 使用者介面、儀表板圖表 |
| **資料庫** | PostgreSQL | 5432 | 持久化儲存 |
| **反向代理** | Nginx | (可選) | 路由轉發、靜態檔案服務 |

---

## ✨ 功能模組

### 📊 儀表板 (Dashboard)
- 設備總數、線上/離線/維護中統計
- 工單狀態分佈與優先級統計
- 警報數量與等級分佈
- 純 CSS/SVG 圖表視覺化

### 📡 設備管理 (Devices)
- 設備列表與狀態篩選（全部/線上/離線/維護中）
- 設備詳細資訊（型號、韌體版本、安裝日期等）
- 即時數據顯示（telemetryData JSONB）
- 狀態快速切換（設為維護中、恢復線上）

### 🔔 警報管理 (Alerts)
- 警報列表與嚴重等級標示（⚠️ / 🟡 / 🔴）
- 警報統計：未處理 / 已確認 / 已解決
- 快速標記已讀、確認處理、解決完成

### 🛠️ 維護管理 (Maintenance)
- 維護紀錄列表與狀態篩選
- 維護類型標示（預防性 / 故障修復 / 定期檢查）
- 狀態流轉：待處理 → 進行中 → 完成
- 維護統計：進行中 / 已完成 / 總次數

### 🎫 工單管理 (Tickets)
- 工單列表與優先級篩選
- 新增工單（可指定設備、優先級、描述）
- 工單統計：按狀態與優先級分佈
- 客製化表單組件支援多欄位型別

---

## 🚀 快速開始

### 系統需求

- **Node.js** ^18.0.0 (建議 20+)
- **PostgreSQL** ^14.0.0
- **npm** ^9.0.0

### 方法一：一鍵啟動腳本（推薦）

```bash
cd ~/solar-storage-system
./start.sh
```

腳本會自動完成：檢查 PostgreSQL → 初始化資料庫 → 建置服務 → 用 PM2 啟動所有服務。

### 方法二：手動啟動

#### 1. 啟動資料庫

```bash
# 使用系統安裝的 PostgreSQL
sudo service postgresql start

# 初始化資料表與種子資料
PGPASSWORD=solar_secure_password_2024 psql -h localhost -U solar_admin -d postgres -f database/init.sql
```

### 2. 啟動後端 API

```bash
cd api
npm install
npm run build

DATABASE_HOST=localhost \
DATABASE_PORT=5432 \
DATABASE_NAME=solar_storage \
DATABASE_USER=solar_admin \
DATABASE_PASSWORD=solar_secure_password_2024 \
JWT_SECRET=your-secret-key \
PORT=8000 \
node dist/main.js
```

### 3. 啟動 WebSocket 服務

```bash
cd websocket
npm install
npm run build
node dist/main.js
```

### 4. 啟動前端

```bash
cd frontend
npm install

VITE_API_URL=http://localhost:8000 npx vite --host 0.0.0.0 --port 5173
```

### 方法三：PM2 直接啟動

```bash
# 啟動所有服務
pm2 start ecosystem.config.js
pm2 save

# 查看狀態
pm2 status
pm2 logs
```

### 方法四：Docker Compose / Podman Compose

```bash
# Docker（一般 Linux/macOS 環境）
docker compose up -d

# Podman（OrbStack / 無 BPF cgroup 環境）
podman-compose up -d
```

> ⚠️ **注意**：`.env` 檔案中的金鑰為開發環境使用，請勿直接用於正式環境。

### 5. 開啟瀏覽器

前往 **http://localhost:3000** 並登入

| 預設帳號 | 預設密碼 |
|----------|----------|
| **admin** | **admin123** |

---

## 🐳 Podman 日常管理指令（OrbStack / 無 Docker 環境）

若系統不支援 Docker（kernel 缺乏 BPF cgroup device 支援），可使用 **Podman** 替代：

```bash
cd ~/solar-storage-system

# ─── 啟動全部服務 ───
podman-compose up -d

# ─── 重新建置並啟動特定服務（原始碼變更後） ───
podman rm -f solar-api               # 移除舊容器
podman-compose up -d api             # 重建映像並啟動

# ─── 查看容器狀態 ───
podman ps
podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ─── 查看服務日誌 ───
podman logs solar-api                # API 日誌
podman logs solar-websocket          # WebSocket 日誌
podman logs solar-frontend           # 前端日誌
podman logs -f solar-api             # 持續追蹤日誌

# ─── 進入容器 ───
podman exec -it solar-api sh         # API 容器 shell
podman exec solar-postgres psql -U solar_admin -d solar_storage -c "SELECT * FROM devices;"

# ─── 停止全部服務 ───
podman-compose down

# ─── 重建映像（Dockerfile 變更後） ───
podman-compose build
podman-compose up -d

# ─── 清除舊容器與映像 ───
podman system prune -f
```

---

## 🧑‍💻 功能頁面導覽

登入後可透過側邊導覽列瀏覽：

| 頁面 | 路徑 | 功能說明 |
|------|------|----------|
| 📊 **儀表板** | `/dashboard` | 系統概覽統計與圖表 |
| 📡 **設備管理** | `/devices` | 設備列表、CRUD、狀態管理 |
| 🔔 **警報管理** | `/alerts` | 警報列表與狀態流轉 |
| 🛠️ **維護管理** | `/maintenance` | 維護紀錄與排程 |
| 🎫 **工單管理** | `/tickets` | 工單建立與追蹤 |

---

## 🛠️ 技術棧

### 後端 (API)

| 技術 | 用途 |
|------|------|
| [NestJS](https://nestjs.com/) | Node.js 後端框架（Controller → Service → Entity 模組化架構） |
| [TypeORM](https://typeorm.io/) | ORM 資料庫操作（支援 PostgreSQL / MySQL） |
| [JWT](https://jwt.io/) | Token 認證（@nestjs/jwt + passport） |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | 密碼加密儲存 |

### 前端 (Frontend)

| 技術 | 用途 |
|------|------|
| [React 18](https://reactjs.org/) | UI 框架 |
| [React Router v6](https://reactrouter.com/) | 客戶端路由與認證保護 |
| [Vite](https://vitejs.dev/) | 建置工具與開發伺服器 |
| [Socket.IO Client](https://socket.io/) | WebSocket 即時通訊 |
| TypeScript | 型別安全開發 |

### 即時通訊 (WebSocket)

| 技術 | 用途 |
|------|------|
| [Socket.IO](https://socket.io/) | 雙向即時通訊 |
| [@nestjs/platform-socket.io](https://docs.nestjs.com/websockets/gateways) | NestJS WebSocket 閘道器 |

### 部署

| 技術 | 用途 |
|------|------|
| [Docker Compose](https://docs.docker.com/compose/) | 容器化部署 |
| [Nginx](https://nginx.org/) | 反向代理與靜態檔案服務 |

---

## 📁 專案結構

```
solar-storage-system/
├── api/                      # NestJS 後端 API
│   ├── src/
│   │   ├── auth/             # 認證模組（Login、JWT、Profile）
│   │   ├── alerts/           # 警報模組（CRUD、統計、嚴重等級）
│   │   ├── devices/          # 設備模組（CRUD、狀態、即時數據）
│   │   ├── maintenance/      # 維護模組（紀錄、排程、完成）
│   │   ├── tickets/          # 工單模組（CRUD、統計、優先級）
│   │   ├── app.module.ts     # 根模組
│   │   └── main.ts           # 進入點
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/       # 共用元件（Charts, Form, Modal, Toast, ErrorBoundary）
│   │   ├── contexts/         # React Context（AuthContext）
│   │   ├── pages/            # 頁面元件（Dashboard, Devices, Alerts, 等）
│   │   ├── services/         # API 服務層（axios-like fetch 封裝）
│   │   ├── types/            # TypeScript 型別定義
│   │   ├── App.tsx           # 路由配置與 Provider 整合
│   │   └── main.tsx          # 進入點
│   ├── Dockerfile
│   └── package.json
│
├── websocket/                # Socket.IO 即時通訊服務
│   ├── src/
│   │   ├── gateway.ts        # WebSocket 閘道器
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── init.sql              # PostgreSQL 初始化腳本
│
├── nginx/
│   └── nginx.conf            # Nginx 反向代理配置
│
├── design/                   # 設計文件
│   ├── 02_use_case_storyboard.md
│   ├── 03_database_schema.md
│   ├── 04_design_system.md
│   └── 05-08_wireframe_*.md  # 情境線稿
│
├── docs/                     # 需求文件
│   └── 01_需求分析書.md
│
├── docker-compose.yml        # Docker Compose 部署配置
└── .env.example              # 環境變數範例
```

---

## 📡 API 端點

### Auth 認證

| 方法 | 路徑 | 說明 | 需要 Token |
|------|------|------|:---------:|
| POST | `/api/auth/login` | 帳號密碼登入 | ❌ |
| GET | `/api/auth/profile` | 取得使用者資料 | ✅ |

### Devices 設備

| 方法 | 路徑 | 說明 | 需要 Token |
|------|------|------|:---------:|
| GET | `/api/devices` | 取得所有設備 | ✅ |
| GET | `/api/devices/stats` | 設備統計 | ✅ |
| GET | `/api/devices/:id` | 取得單一設備 | ✅ |
| POST | `/api/devices` | 新增設備 | ✅ |
| PUT | `/api/devices/:id` | 更新設備資料 | ✅ |
| DELETE | `/api/devices/:id` | 刪除設備 | ✅ |
| PUT | `/api/devices/:id/status` | 切換設備狀態 | ✅ |
| PUT | `/api/devices/:id/telemetry` | 更新即時數據 | ✅ |

### Alerts 警報

| 方法 | 路徑 | 說明 | 需要 Token |
|------|------|------|:---------:|
| GET | `/api/alerts` | 取得所有警報 | ✅ |
| GET | `/api/alerts/stats` | 警報統計 | ✅ |
| GET | `/api/alerts/critical` | 取得緊急警報 | ✅ |
| POST | `/api/alerts` | 新增警報 | ✅ |
| PUT | `/api/alerts/:id/status` | 變更警報狀態 | ✅ |
| DELETE | `/api/alerts/resolved` | 清除已解決警報 | ✅ |

### Tickets 工單

| 方法 | 路徑 | 說明 | 需要 Token |
|------|------|------|:---------:|
| GET | `/api/tickets` | 取得所有工單 | ✅ |
| GET | `/api/tickets/statistics` | 工單統計 | ✅ |
| GET | `/api/tickets/:id` | 取得單一工單 | ✅ |
| POST | `/api/tickets` | 建立工單 | ✅ |
| PUT | `/api/tickets/:id` | 更新工單 | ✅ |
| DELETE | `/api/tickets/:id` | 刪除工單 | ✅ |
| GET | `/api/tickets/priority/:priority` | 依優先級篩選 | ✅ |

### Maintenance 維護

| 方法 | 路徑 | 說明 | 需要 Token |
|------|------|------|:---------:|
| GET | `/api/maintenance` | 取得所有維護紀錄 | ✅ |
| GET | `/api/maintenance/stats` | 維護統計 | ✅ |
| GET | `/api/maintenance/upcoming` | 即將到來的維護 | ✅ |
| GET | `/api/maintenance/device/:deviceId` | 依設備查詢 | ✅ |
| GET | `/api/maintenance/:id` | 取得單一紀錄 | ✅ |
| POST | `/api/maintenance` | 新增維護排程 | ✅ |
| PUT | `/api/maintenance/:id/status` | 變更維護狀態 | ✅ |
| PUT | `/api/maintenance/:id/complete` | 完成維護並記錄 | ✅ |
| DELETE | `/api/maintenance/:id` | 刪除維護紀錄 | ✅ |

---

## 📝 設計文件

完整的設計文件存放在 `design/` 與 `docs/` 目錄：

- 📄 **[需求分析書](docs/01_需求分析書.md)** — 使用者角色、功能與非功能需求定義
- 🎬 **[使用情境 Storyboard](design/02_use_case_storyboard.md)** — 四個核心業務流程模擬
- 🗄️ **[資料庫模型設計](design/03_database_schema.md)** — ERD 與欄位定義
- 🎨 **[設計規範](design/04_design_system.md)** — 色彩、排版、組件規範
- 🖼️ **[情境 A 線稿](design/05_wireframe_case_a.md)** — 客服轉派桌面端線稿
- 🖼️ **[情境 B 線稿](design/06_wireframe_case_b.md)** — 告警觸發線稿
- 🖼️ **[情境 C 線稿](design/07_wireframe_case_c.md)** — 現場維修線稿
- 🖼️ **[情境 D 線稿](design/08_wireframe_case_d.md)** — 管理審核線稿

---

## 🔧 開發中功能

- [ ] 多角色權限細粒度控制
- [ ] 進階圖表（折線圖、圓餅圖）
- [ ] 搜尋與篩選強化
- [ ] 分頁支援
- [ ] 匯出報表（CSV/PDF）

### ✅ 已實現功能

- [x] 設備 CRUD 與即時資料顯示
- [x] 警報管理與狀態流轉
- [x] 工單建立/編輯/刪除與統計
- [x] 維護排程與完成回報
- [x] 儀表板統計圖表
- [x] JWT 登入認證
- [x] WebSocket 即時通訊
- [x] Docker/Podman 容器化部署

---

## 📄 授權

本專案僅供學習與示範用途。

---

*由 [Hermes Agent](https://hermes-agent.nousresearch.com) 自動開發與維護*
