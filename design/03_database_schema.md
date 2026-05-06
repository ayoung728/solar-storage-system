# 太陽能儲能管理系統 - 資料庫模型設計書 (Database Schema Design)

**版本：** v1.0  
**日期：** 2026-04-30  
**作者：** Hermes Agent

---

## 1. 前言

本文件定義了「太陽能儲能管理系統」的核心資料庫結構。設計目標是確保數據的一致性、完整性，並能支撐前述「需求分析書」與「使用情境 Storyboard」中所定義的所有業務流程。

本設計採用 **關聯式資料庫 (RDBMS)** 架構，建議使用 **PostgreSQL** 進行部署。

---

## 2. 核心實體與關聯圖 (ERD Concept)

### 2.1 實體清單

| 分類 | 實體名稱 (Entity) | 說明 |
|------|-------------------|------|
| **使用者層** | `users` | 系統帳號、密碼、角色權限 |
| **組織層** | `plants` | 電站資訊 (如：A區電站) |
| **資產層** | `equipment` | 電站內的設備 (如：變流器、電池組) |
| **業務層** | `work_orders` | 客服與維修的核心工單 |
| **業務層** | `tasks` | 派發給技術員的具體任務 |
| **監控層** | `alerts` | 設備告警紀錄 |
| **庫存層** | `inventory_items` | 備品/零件資訊 |
| **紀錄層** | `attachments` | 照片、文件附件 |

### 2.2 主要關聯關係 (Relationships)

- **One-to-Many (1:N)**
    - `plants` $\rightarrow$ `equipment` (一個電站擁有多個設備)
    - `plants` $\rightarrow$ `work_orders` (一個電站可有多個工單)
    - `equipment` $\rightarrow$ `alerts` (一個設備可產生多個告警)
    - `users` $\rightarrow$ `work_orders` (一個使用者可建立/處理多個工單)
    - `work_orders` $\rightarrow$ `tasks` (一個工單可拆解為多個任務)
- **Many-to-One (N:1)**
    - `tasks` $\rightarrow$ `users` (多個任務指派給一個技術員)
- **Many-to-Many (M:N)**
    - `tasks` $\leftrightarrow$ `inventory_items` (透過中間表記錄任務使用的備品)

---

## 3. 詳細欄位設計 (Detailed Schema)

### 3.1 使用者模組 (`users`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `user_id` | UUID (PK) | NOT NULL | 使用者唯一識別碼 |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | 登入帳號 |
| `password_hash` | VARCHAR(255) | NOT NULL | 加密後的密碼 |
| `full_name` | VARCHAR(100) | NOT NULL | 姓名 |
| `role` | ENUM | NOT NULL | [CS, OE, MT, CL, SA] |
| `email` | VARCHAR(100) | UNIQUE | 電子郵件 |
| `phone` | VARCHAR(20) | | 電話號碼 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |

### 3.2 電站模組 (`plants`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `plant_id` | UUID (PK) | NOT NULL | 電站唯一識別碼 |
| `name` | VARCHAR(100) | NOT NULL | 電站名稱 |
| `location` | TEXT | | 地理位置/地址 |
| `owner_id` | UUID (FK) | REFERENCES users(user_id) | 所屬客戶/業主 ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |

### 3.3 設備模組 (`equipment`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `equipment_id` | UUID (PK) | NOT NULL | 設備唯一識別碼 |
| `plant_id` | UUID (FK) | REFERENCES plants(plant_id) | 所屬電站 ID |
| `name` | VARCHAR(100) | NOT NULL | 設備名稱/編號 |
| `type` | VARCHAR(50) | | [Inverter, Battery, Sensor...] |
| `status` | ENUM | NOT NULL | [Normal, Warning, Fault, Maintenance] |
| `install_date` | DATE | | 安裝日期 |
| `warranty_expiry`| DATE | | 保固到期日 |

### 3.4 工單模組 (`work_orders`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `order_id` | UUID (PK) | NOT NULL | 工單唯一識別碼 |
| `order_no` | VARCHAR(20) | UNIQUE, NOT NULL | 格式化編號 (如: WO-20260430-001) |
| `title` | VARCHAR(200) | NOT NULL | 工單標題 |
| `description` | TEXT | | 問題描述 |
| `priority` | ENUM | NOT NULL | [Low, Medium, High, Urgent] |
| `status` | ENUM | NOT NULL | [New, Assigned, In_Progress, Pending, Completed, Closed] |
| `creator_id` | UUID (FK) | REFERENCES users(user_id) | 建立者 ID |
| `assignee_id` | UUID (FK) | REFERENCES users(user_id) | 負責人 ID |
| `plant_id` | UUID (FK) | REFERENCES plants(plant_id) | 關聯電站 ID |
| `equipment_id` | UUID (FK) | REFERENCES equipment(equipment_id)| 關聯設備 ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 建立時間 |
| `updated_at` | TIMESTAMP | | 最後更新時間 |

### 3.5 任務模組 (`tasks`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `task_id` | UUID (PK) | NOT NULL | 任務唯一識別碼 |
| `order_id` | UUID (FK) | REFERENCES work_orders(order_id)| 所屬工單 ID |
| `technician_id` | UUID (FK) | REFERENCES users(user_id) | 指派技術員 ID |
| `task_desc` | TEXT | | 具體執行任務說明 |
| `status` | ENUM | NOT NULL | [Todo, Doing, Done] |
| `completed_at` | TIMESTAMP | | 完成時間 |

### 3.6 告警模組 (`alerts`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `alert_id` | UUID (PK) | NOT NULL | 告警唯一識別碼 |
| `equipment_id` | UUID (FK) | REFERENCES equipment(equipment_id)| 觸發設備 ID |
| `severity` | ENUM | NOT NULL | [Low, Medium, High, Critical] |
| `message` | TEXT | NOT NULL | 告警訊息內容 |
| `is_resolved` | BOOLEAN | DEFAULT FALSE | 是否已處理完成 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 觸發時間 |

### 3.7 附件模組 (`attachments`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `attachment_id` | UUID (PK) | NOT NULL | 附件唯一識別碼 |
| `parent_id` | UUID | NOT NULL | 父層 ID (工單或任務) |
| `parent_type` | VARCHAR(20) | NOT NULL | [ORDER, TASK] |
| `file_url` | TEXT | NOT NULL | 檔案儲存路徑/URL |
| `file_type` | VARCHAR(20) | | [Image, PDF, Doc] |
| `uploaded_by` | UUID (FK) | REFERENCES users(user_id) | 上傳者 ID |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 上傳時間 |

### 3.8 備品使用紀錄 (`task_consumables`)

| 欄位名稱 | 型態 | 約束 | 說明 |
|----------|------|------|------|
| `id` | UUID (PK) | NOT NULL | 紀錄唯一識別碼 |
| `task_id` | UUID (FK) | REFERENCES tasks(task_id) | 關聯任務 ID |
| `item_id` | UUID (FK) | REFERENCES inventory_items(item_id)| 關聯備品 ID |
| `quantity` | DECIMAL | NOT NULL | 使用數量 |

---

## 4. 設計考量與決策 (Design Decisions)

### 4.1 UUID vs Serial ID
- **決定**：所有主鍵 (Primary Key) 採用 `UUID`。
- **理由**：在分散式系統或未來擴展時，UUID 能有效避免 ID 衝突與預測性問題。

### 4.2 軟刪除 (Soft Delete)
- **決定**：所有主要實體（如 `users`, `plants`, `equipment`）應包含 `deleted_at` 欄位。
- **理由**：工業系統對數據完整性要求極高，刪除操作應改為標記失效，以便後續稽核與數據恢復。

### 4.3 時間序列數據處理 (Time-Series Data)
- **決定**：設備的即時監控數據（如電壓、電流）不應存入上述業務表，而應使用獨立的時序資料庫（如 **TimescaleDB**）或專門的 `telemetry` 表。
- **理由**：業務表處理的是「狀態」與「流程」，而時序數據量極大，需分開管理以維持效能。

### 4.4 權限模型 (RBAC)
- **決定**：採用 Role-Based Access Control (RBAC)。
- **理由：** 透過 `users.role` 與關聯的權限表，可以精確控制不同角色對特定模組的操作權。

---

## 5. 總結

本設計提供了一個靈活且具擴展性的資料結構，足以支撐從單一電站到多電站規模的運維管理需求。

**下一步建議：**
1.  將此 Schema 轉化為 **SQL DDL (Data Definition Language)** 腳本。
2.  開始設計 **UI Wireframes**（介面原型圖）。

---
**文件結束**
