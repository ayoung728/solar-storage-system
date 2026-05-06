-- =============================================================================
-- 太陽能儲能監控系統 - PostgreSQL 資料庫初始化腳本
-- Solar Energy Storage Management System - Database Initialization
-- =============================================================================

-- 建立使用者資料表
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

-- 建立設備資料表
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('solar_panel', 'battery', 'inverter', 'monitor')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
    location VARCHAR(200),
    specifications JSONB,
    telemetry_data JSONB,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立警報資料表
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

-- 建立維護紀錄資料表
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

-- 建立工單資料表
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

-- 建立索引以優化查詢效能
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_type ON devices(device_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_maintenance_device_id ON maintenance(device_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- 建立預設管理員帳號 (密碼: admin123)
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@solar-storage.local',
    '$2a$10$YQ/GOXXHnFfEeDvGjqM3OeqCJlNqR.6tXZBhFvLxGzEiJkO.pQrS6',
    '系統管理員',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- 建立測試設備資料
INSERT INTO devices (name, device_type, status, location, specifications) VALUES
('太陽能板陣列 A', 'solar_panel', 'online', '屋頂區域 A', '{"capacity_kw": 5.0, "efficiency": 0.18, "panels_count": 20}'),
('太陽能板陣列 B', 'solar_panel', 'online', '屋頂區域 B', '{"capacity_kw": 5.0, "efficiency": 0.18, "panels_count": 20}'),
('電池儲存系統', 'battery', 'online', '機房', '{"capacity_kwh": 100, "charge_rate_kw": 25}'),
('逆變器主單元', 'inverter', 'online', '機房', '{"power_kw": 10, "efficiency": 0.96}'),
('監控系統主機', 'monitor', 'maintenance', '控制室', '{"sensors_count": 50, "sampling_rate_hz": 1}');

-- 建立測試警報資料
INSERT INTO alerts (device_id, severity, message, status) VALUES
(1, 'high', '太陽能板陣列 A 效率低於預期值 85%', 'unresolved'),
(2, 'medium', '太陽能板陣列 B 溫度偏高，建議檢查散熱', 'acknowledged'),
(3, 'critical', '電池儲存系統電量低於 20%，請立即充電', 'unresolved');
