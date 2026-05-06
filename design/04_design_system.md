# 太陽能儲能管理系統 - 設計規範 (Design System)

**版本：** v1.0  
**日期：** 2026-04-30  
**作者：** Hermes Agent

---

## 1. 前言

本文件定義了「太陽能儲能管理系統」的視覺語言與介面規範。所有 UI 設計、原型圖 (Wireframes) 與前端開發都應遵循此規範，以確保系統在不同設備（桌面、平板、手機）上的高度一致性與專業感。

---

## 2. 色彩規範 (Color Palette)

為了確保在工業現場（可能光線強烈或昏暗）的閱讀性，我們採用高對比度的專業色調。

### 2.1 品牌與主色 (Brand Colors)
- **Primary (科技藍)**: `#1A237E` (Deep Navy) - 用於導覽列、主要按鈕。
- **Secondary (能源青)**: `#00B8D4` (Cyan) - 用於強調、數據圖表。
- **Accent (活力橙)**: `#FF8F00` (Amber) - 用於重要提醒或特定功能。

### 2.2 狀態色 (Status Colors)
這些顏色必須與業務邏輯中的「嚴重程度」嚴格對應。

| 狀態 | 色碼 (Hex) | 用途說明 |
|------|------------|----------|
| **Critical/Error (紅色)** | `#D32F2F` | 設備故障、緊急告警、刪除操作 |
| **Warning (橘色)** | `#FFA000` | 預警、中級告警、待處理任務 |
| **Success (綠色)** | `#388E3C` | 任務完成、系統正常、備品入庫 |
| **Info (藍色)** | `#1976D2` | 一般資訊、正在進行中、查詢結果 |
| **Neutral (灰色)** | `#757575` | 次要文字、禁用狀態、背景線條 |

### 2.3 背景與層級 (Background & Surface)
- **Base Background**: `#F5F7FA` (極淺灰藍) - 頁面底色。
- **Surface/Card**: `#FFFFFF` (純白) - 卡片、容器底色。
- **Overlay/Modal**: `rgba(0, 0, 0, 0.5)` - 遮罩層。

---

## 3. 排版與字體 (Typography)

### 3.1 字體選擇
- **主要字體**: `Inter`, `Roboto`, 或系統預設無襯線字體 (Sans-serif)。
- **數據字體**: 建議使用等寬字體 (Monospace) 或具有良好數字對齊的字體（如 `Roboto`），確保數據列對齊。

### 3.2 字級層級 (Type Scale)
| 層級 | 大小 (px/rem) | 字重 (Weight) | 用途 |
|------|--------------|---------------|------|
| **H1** | 32px / 2rem | Bold (700) | 頁面標題 |
| **H2** | 24px / 1.5rem | Bold (700) | 模組標題 |
| **H3** | 18px / 1.125rem| Semi-Bold (600)| 卡片/小標題 |
| **Body Large** | 16px / 1rem | Regular (400) | 主要內容、輸入框文字 |
| **Body Small** | 14px / 0.875rem| Regular (400) | 次要資訊、表格內容 |
| **Caption** | 12px / 0.75rem | Regular (400) | 輔助說明、時間戳記 |

---

## 4. 組件規範 (Component Library)

### 4.1 按鈕 (Buttons)
- **Primary Button**: 背景色為 `Primary`，文字為白色。用於「提交」、「儲存」。
- **Secondary Button**: 邊框色為 `Primary`，文字為 `Primary`。用於「取消」、「返回」。
- **Ghost/Text Button**: 無背景，僅文字。用於「查看更多」、「取消」。
- **Danger Button**: 背景色為 `Critical`，文字為白色。用於「刪除」、「重置」。

### 4.2 輸入控制 (Inputs)
- **Text Input**: 邊框為 `Neutral`，點擊時變更為 `Primary`。
- **Select/Dropdown**: 需有清晰的下拉箭頭與選中狀態。
- **Date Picker**: 支援日期、時間選擇，需符合行動端操作習慣。

### 4.3 卡片與容器 (Cards & Containers)
- **Card**: 白色背景，輕微陰影 (`box-shadow`) 或 1px 灰色邊框。
- **Shadow**: 使用柔和的陰影，避免過於厚重。

### 4.4 數據圖表 (Data Visualization)
- **Line Charts**: 使用 `Secondary` 色系，線條粗度適中。
- **Pie/Donut Charts**: 使用對比鮮明的色彩區分分類。

---

## 5. 響應式佈局規則 (Responsive Rules)

系統需支援 **Desktop (PC)**, **Tablet (平板)**, 與 **Mobile (手機)** 三種主要場景。

### 5.1 佈局策略
- **Desktop (≥ 1024px)**: 使用側邊導覽列 (Sidebar) + 主內容區。
- **Tablet (768px - 1023px)**: 側邊欄收縮為圖示，或改用頂部導覽列。
- **Mobile (< 767px)**: 使用底部導覽列 (Bottom Navigation) 或漢堡選單 (Hamburger Menu)。

### 5.2 元素變化
- **表格 $\rightarrow$ 卡片**: 在手機端，複雜的數據表格應自動轉換為「卡片式列表」，以利於垂直捲動。
- **多欄 $\rightarrow$ 單欄**: 桌面端的多欄佈局 (Grid) 在手機端應自動堆疊為單一垂直列。
- **觸控優化**: 所有按鈕與點擊區域在行動端需具備足夠的觸控範圍 (至少 44x44 px)。

---
**文件結束**
