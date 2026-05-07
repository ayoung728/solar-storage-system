-- =============================================================================
-- 太陽能儲能監控系統 - PostgreSQL 資料庫初始化腳本 (Phase 2)
-- Solar Energy Storage Management System - Database Initialization
-- =============================================================================

-- =========================================================================
-- 使用者資料表
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- Phase 1 既有資料表
-- =========================================================================
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50),
    site_id INTEGER,
    name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('solar_panel', 'battery', 'inverter', 'monitor')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
    location VARCHAR(200),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    installed_date DATE,
    specifications JSONB,
    telemetry_data JSONB,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'acknowledged', 'resolved')),
    acknowledged_by INTEGER,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    technician VARCHAR(100),
    cost DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to INTEGER,
    device_id INTEGER REFERENCES devices(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- Phase 2 新資料表
-- =========================================================================

-- 客戶
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(20),
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(200),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 案場
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    site_type VARCHAR(50) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    capacity_kwp DECIMAL(10, 2),
    installed_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'constructing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 單元
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    unit_type VARCHAR(50) NOT NULL,
    specifications JSONB,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'retired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 保養項目
CREATE TABLE IF NOT EXISTS maintenance_items (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    frequency_type VARCHAR(20) NOT NULL CHECK (frequency_type IN ('weekly', 'monthly', 'quarterly', 'half_yearly', 'yearly')),
    frequency_value INTEGER NOT NULL DEFAULT 1,
    steps JSONB,
    acceptance_criteria JSONB,
    estimated_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 工作項目
CREATE TABLE IF NOT EXISTS work_items (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('maintenance_plan', 'device_alert', 'customer_ticket', 'manual')),
    source_id INTEGER,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    site_id INTEGER REFERENCES sites(id),
    device_id INTEGER REFERENCES devices(id),
    unit_id INTEGER REFERENCES units(id),
    maintenance_item_id INTEGER REFERENCES maintenance_items(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_pool', 'assigned', 'in_progress', 'completed', 'cancelled')),
    estimated_minutes INTEGER,
    actual_minutes INTEGER,
    result JSONB,
    result_notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 派工包
CREATE TABLE IF NOT EXISTS dispatch_packages (
    id SERIAL PRIMARY KEY,
    package_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200),
    executor_type VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (executor_type IN ('internal', 'contractor')),
    engineer_id INTEGER,
    contractor_id INTEGER,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'assigned', 'accepted', 'in_progress', 'awaiting_acceptance', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium',
    scheduled_date DATE,
    completed_date DATE,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 派工包項目
CREATE TABLE IF NOT EXISTS dispatch_package_items (
    id SERIAL PRIMARY KEY,
    package_id INTEGER NOT NULL REFERENCES dispatch_packages(id) ON DELETE CASCADE,
    work_item_id INTEGER NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(package_id, work_item_id)
);

-- 執行紀錄
CREATE TABLE IF NOT EXISTS execution_records (
    id SERIAL PRIMARY KEY,
    dispatch_package_id INTEGER NOT NULL REFERENCES dispatch_packages(id),
    executor_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'awaiting_acceptance', 'completed', 'cancelled')),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    customer_name VARCHAR(200),
    customer_signature TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    acceptance_status VARCHAR(20),
    acceptance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 執行照片
CREATE TABLE IF NOT EXISTS execution_photos (
    id SERIAL PRIMARY KEY,
    execution_record_id INTEGER NOT NULL REFERENCES execution_records(id) ON DELETE CASCADE,
    work_item_id INTEGER REFERENCES work_items(id),
    step_order INTEGER,
    photo_type VARCHAR(20) NOT NULL CHECK (photo_type IN ('before', 'after', 'signature', 'acceptance', 'other')),
    file_path TEXT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 外包維修商
CREATE TABLE IF NOT EXISTS contractors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(200),
    address TEXT,
    tax_id VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    bank_name VARCHAR(200),
    bank_account VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 付款紀錄
CREATE TABLE IF NOT EXISTS payment_records (
    id SERIAL PRIMARY KEY,
    execution_record_id INTEGER NOT NULL REFERENCES execution_records(id),
    contractor_id INTEGER NOT NULL REFERENCES contractors(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'paid', 'cancelled')),
    pricing_type VARCHAR(20) CHECK (pricing_type IN ('fixed', 'hourly', 'itemized')),
    hourly_rate DECIMAL(10, 2),
    total_hours DECIMAL(5, 1),
    items JSONB,
    invoice_number VARCHAR(100),
    invoice_date DATE,
    paid_date DATE,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 客服工程師
CREATE TABLE IF NOT EXISTS engineers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(200),
    shift_group VARCHAR(10) NOT NULL CHECK (shift_group IN ('day', 'night', 'backup')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 排班表
CREATE TABLE IF NOT EXISTS engineer_schedules (
    id SERIAL PRIMARY KEY,
    engineer_id INTEGER REFERENCES engineers(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    shift VARCHAR(10) NOT NULL CHECK (shift IN ('day', 'night', 'backup')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(engineer_id, work_date)
);

-- =========================================================================
-- 索引
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_site ON devices(site_id);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(device_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_sites_customer ON sites(customer_id);
CREATE INDEX IF NOT EXISTS idx_units_device ON units(device_id);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_work_items_site ON work_items(site_id);
CREATE INDEX IF NOT EXISTS idx_work_items_source ON work_items(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_work_items_priority ON work_items(priority);
CREATE INDEX IF NOT EXISTS idx_dp_status ON dispatch_packages(status);
CREATE INDEX IF NOT EXISTS idx_dp_engineer ON dispatch_packages(engineer_id);
CREATE INDEX IF NOT EXISTS idx_dpi_package ON dispatch_package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_dpi_work_item ON dispatch_package_items(work_item_id);
CREATE INDEX IF NOT EXISTS idx_er_dispatch ON execution_records(dispatch_package_id);
CREATE INDEX IF NOT EXISTS idx_er_status ON execution_records(status);
CREATE INDEX IF NOT EXISTS idx_ep_record ON execution_photos(execution_record_id);
CREATE INDEX IF NOT EXISTS idx_pr_contractor ON payment_records(contractor_id);
CREATE INDEX IF NOT EXISTS idx_pr_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_es_date ON engineer_schedules(work_date);
CREATE INDEX IF NOT EXISTS idx_es_engineer ON engineer_schedules(engineer_id);

-- =========================================================================
-- 種子資料
-- =========================================================================

-- 管理員帳號 (密碼: admin123)
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@solar-storage.local',
    '$2a$10$IeYSNlFCQIsrVckeFSMcDOVkPSAMbWX2Jwja7L3q1di7.kpRat9Ga',
    '系統管理員',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- 測試客戶
INSERT INTO customers (code, name, tax_id, contact_person, phone, email, address, status)
VALUES
    ('CUST-001', '內湖科技股份有限公司', '12345678', '林經理', '02-1234-5678', 'lin@neihu-tech.tw', '台北市內湖區科技路100號', 'active'),
    ('CUST-002', '桃園物流中心', '23456789', '王廠長', '03-9876-5432', 'wang@taoyuan-logistics.tw', '桃園市大園區物流路200號', 'active')
ON CONFLICT (code) DO NOTHING;

-- 測試案場
INSERT INTO sites (code, customer_id, name, site_type, address, latitude, longitude, capacity_kwp, installed_date, status)
VALUES
    ('CUST-001-001', 1, '內湖科技廠屋頂太陽能', '屋頂型', '台北市內湖區科技路100號', 25.078, 121.575, 500.00, '2024-01-15', 'active'),
    ('CUST-001-002', 1, '內湖科技廠停車棚', '車棚型', '台北市內湖區科技路100號', 25.079, 121.576, 150.00, '2024-06-01', 'active'),
    ('CUST-002-001', 2, '桃園物流中心屋頂', '屋頂型', '桃園市大園區物流路200號', 25.050, 121.200, 800.00, '2024-03-20', 'active')
ON CONFLICT (code) DO NOTHING;

-- 設備擴充（更新既有設備加入 site_id）
UPDATE devices SET site_id = 1, code = 'CUST-001-001-PANEL-01', manufacturer = '友達光電', model = 'AUO-450W' WHERE id = 1;
UPDATE devices SET site_id = 1, code = 'CUST-001-001-PANEL-02', manufacturer = '友達光電', model = 'AUO-450W' WHERE id = 2;
UPDATE devices SET site_id = 1, code = 'CUST-001-001-BATT-01', manufacturer = '台達電', model = 'DVP-100kWh' WHERE id = 3;
UPDATE devices SET site_id = 1, code = 'CUST-001-001-INVT-01', manufacturer = '台達電', model = 'DVP-10kW' WHERE id = 4;
UPDATE devices SET site_id = 2, code = 'CUST-001-002-MON-01', manufacturer = '研華', model = 'ADV-5200' WHERE id = 5;

-- 測試單元
INSERT INTO units (device_id, code, name, unit_type, specifications, status) VALUES
    (4, 'CUST-001-001-INVT-01-FAN-01', '散熱風扇模組 A', 'cooling_fan', '{"type": "axial", "rpm": 3000, "voltage": "24V"}', 'active'),
    (4, 'CUST-001-001-INVT-01-CAP-01', '電容模組', 'capacitor_bank', '{"capacity": "1000uF", "voltage": "450V"}', 'active'),
    (4, 'CUST-001-001-INVT-01-CTRL-01', '控制板', 'control_board', '{"firmware": "v2.3", "cpu": "ARM Cortex-M4"}', 'active'),
    (3, 'CUST-001-001-BATT-01-BMS-01', '電池管理系統', 'bms', '{"protocol": "CAN bus", "cells": 128}', 'active')
ON CONFLICT DO NOTHING;

-- 測試保養項目
INSERT INTO maintenance_items (unit_id, name, frequency_type, frequency_value, steps, acceptance_criteria, estimated_minutes, is_active) VALUES
    (1, '散熱風扇清潔與檢查', 'quarterly', 1,
     '[{"order":1,"description":"關閉設備電源並確認斷電","est_min":5,"tools":["驗電筆"]},{"order":2,"description":"拆開散熱風扇外蓋","est_min":3,"tools":["螺絲起子組"]},{"order":3,"description":"清潔風扇葉片與散熱鰭片","est_min":10,"tools":["壓縮空氣罐","毛刷"]},{"order":4,"description":"檢查軸承運轉是否順暢","est_min":5},{"order":5,"description":"組裝回原位並測試運轉","est_min":5,"tools":["螺絲起子組"]}]',
     '[{"order":1,"item":"風扇運轉無異音","condition":"normal"},{"order":2,"item":"散熱鰭片無阻塞","condition":"clean"},{"order":3,"item":"運轉電流","condition":"range","range":{"min":0.5,"max":1.2,"unit":"A"}}]',
     30, true),
    (2, '電容模組檢測', 'yearly', 1,
     '[{"order":1,"description":"關閉逆變器電源","est_min":5},{"order":2,"description":"量測電容容量與內阻","est_min":10,"tools":["LCR電錶"]},{"order":3,"description":"檢查有無漏液或膨脹","est_min":5},{"order":4,"description":"記錄量測數據並恢復","est_min":5}]',
     '[{"order":1,"item":"電容容量","condition":"range","range":{"min":850,"max":1100,"unit":"uF"}},{"order":2,"item":"外觀無異常","condition":"normal"}]',
     30, true)
ON CONFLICT DO NOTHING;

-- 測試工作項目
INSERT INTO work_items (source_type, title, description, priority, site_id, device_id, status) VALUES
    ('manual', '內湖科技廠 逆變器散熱風扇 Q2 保養', '依保養計畫，逆變器散熱風扇需進行季度清潔與檢查', 'medium', 1, 4, 'in_pool'),
    ('manual', '內湖科技廠 電容模組年度檢測', '年度電容量測量與外觀檢查', 'low', 1, 4, 'in_pool'),
    ('manual', '桃園物流中心 變流器異常報修', '客服通報：變流器顯示錯誤碼 E-103', 'high', 3, 1, 'in_pool')
ON CONFLICT DO NOTHING;

-- 測試客服工程師
INSERT INTO engineers (user_id, employee_id, full_name, phone, email, shift_group, is_active) VALUES
    (1, 'ENG-001', '王大明', '0912-345-678', 'wang@solar-storage.local', 'day', true),
    (null, 'ENG-002', '陳小華', '0923-456-789', 'chen@solar-storage.local', 'day', true),
    (null, 'ENG-003', '張志明', '0934-567-890', 'chang@solar-storage.local', 'night', true),
    (null, 'ENG-004', '李怡君', '0945-678-901', 'lee@solar-storage.local', 'night', true),
    (null, 'ENG-005', '林強生', '0956-789-012', 'lin@solar-storage.local', 'backup', true)
ON CONFLICT (employee_id) DO NOTHING;

-- 測試外包商
INSERT INTO contractors (name, contact_person, phone, email, tax_id, bank_name, bank_account) VALUES
    ('永鑫機電工程有限公司', '黃老闆', '02-2345-6789', 'yongxin@example.com', '34567890', '台灣銀行', '123-456-78901'),
    ('天力電力維護有限公司', '陳協理', '03-3456-7890', 'tianli@example.com', '45678901', '玉山銀行', '234-567-89012')
ON CONFLICT DO NOTHING;

-- 測試排班 (當前月份)
INSERT INTO engineer_schedules (engineer_id, work_date, shift)
SELECT e.id, d.date, s.shift
FROM (VALUES
    (1, 'day'), (2, 'day'), (3, 'night'), (4, 'night'), (5, 'backup')
) AS e(eng_id, shift_group)
CROSS JOIN (
    SELECT generate_series(
        date_trunc('month', CURRENT_DATE)::date,
        (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date,
        '1 day'::interval
    )::date AS date
) AS d
CROSS JOIN (VALUES
    (1, 'day', 'day'), (2, 'day', 'day'), (3, 'night', 'night'), (4, 'night', 'night'), (5, 'backup', 'backup')
) AS s(eng_id2, shift, s_shift)
WHERE e.eng_id = s.eng_id2
  AND (
    s.shift != 'backup'
    OR (s.shift = 'backup' AND EXTRACT(dow FROM d.date) BETWEEN 1 AND 5)
  )
  AND (
    s.shift = 'backup'
    OR (floor(EXTRACT(day FROM d.date)::int / 2) % 2) = (CASE WHEN e.eng_id IN (1,3) THEN 0 ELSE 1 END)
  )
ON CONFLICT (engineer_id, work_date) DO NOTHING;
