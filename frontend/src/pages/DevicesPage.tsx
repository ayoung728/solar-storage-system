import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Device, DeviceStats } from '../types'

function DevicesPage() {
  const { token } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [stats, setStats] = useState<DeviceStats | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDevices() {
      try {
        setLoading(true)
        setError(null)
        const [devicesData, statsData] = await Promise.all([
          api.getDevices(token),
          api.getDeviceStats(token),
        ])
        setDevices(devicesData)
        setStats(statsData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '載入設備資料失敗'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [token])

  const filteredDevices = filter === 'all'
    ? devices
    : devices.filter(d => d.status === filter)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'online': return <span className="status-badge online">線上</span>
      case 'offline': return <span className="status-badge offline">離線</span>
      case 'maintenance': return <span className="status-badge maintenance">維護中</span>
      case 'warning': return <span className="status-badge warning">⚠️ 警告</span>
      default: return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'solar_panel': return '太陽能板'
      case 'battery_storage': return '電池儲能'
      case 'inverter': return '逆變器'
      case 'monitoring': return '監控系統'
      default: return type
    }
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateDeviceStatus(id, newStatus, token)
      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: newStatus as Device['status'] } : d))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新狀態失敗'
      setError(message)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <span>載入設備資料...</span>
      </div>
    )
  }

  if (error) {
    return (
      <>
        <div className="page-header"><h2>🔌 設備管理</h2></div>
        <div className="error">{error}</div>
      </>
    )
  }

  return (
    <>
      {/* 頁面標題 */}
      <div className="page-header">
        <h2>🔌 設備管理</h2>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => alert('新增設備功能開發中')}>
            + 新增設備
          </button>
        </div>
      </div>

      {/* 統計摘要卡片 */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card success">
            <div className="stat-label">📦 總設備數</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">
              <span className="stat-dot online" /> 線上
            </div>
            <div className="stat-value">{stats.online}</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-label">
              <span className="stat-dot offline" /> 離線
            </div>
            <div className="stat-value">{stats.offline}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-label">
              <span className="stat-dot warning" /> 警告 / 維護中
            </div>
            <div className="stat-value">{(stats.warning || 0) + (stats.maintenance || 0)}</div>
          </div>
        </div>
      )}

      {/* 篩選器 */}
      <div className="filter-bar">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('all')}
        >
          全部 ({devices.length})
        </button>
        <button
          className={`btn ${filter === 'online' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('online')}
        >
          線上 ({devices.filter(d => d.status === 'online').length})
        </button>
        <button
          className={`btn ${filter === 'offline' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('offline')}
        >
          離線 ({devices.filter(d => d.status === 'offline').length})
        </button>
        <button
          className={`btn ${filter === 'maintenance' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('maintenance')}
        >
          維護中 ({devices.filter(d => d.status === 'maintenance').length})
        </button>
      </div>

      {/* 設備卡片列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredDevices.map(device => (
          <div key={device.id} className="alert-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>
                  {device.type === 'solar_panel' ? '☀️' : device.type === 'battery_storage' ? '🔋' : device.type === 'inverter' ? '⚡' : '📡'}
                </span>
                <div>
                  <div className="alert-title">{device.name}</div>
                  <div className="alert-meta">
                    <span>{getTypeLabel(device.type)}</span>
                    <span>編號: {device.deviceId}</span>
                    {device.location && <span>📍 {device.location}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {getStatusBadge(device.status)}
                <a href={`/devices/${device.id}`} className="btn btn-outline btn-sm">詳情</a>
              </div>
            </div>

            <div className="alert-meta" style={{ marginBottom: 12, gap: 16 }}>
              {device.manufacturer && <span>🏭 {device.manufacturer} {device.model || ''}</span>}
              {device.firmwareVersion && <span>📱 v{device.firmwareVersion}</span>}
              {device.installedDate && <span>📅 安裝: {device.installedDate}</span>}
              {device.lastMaintenanceDate && <span>🔧 維護: {device.lastMaintenanceDate}</span>}
            </div>

            {/* 即時數據 */}
            {device.telemetryData && Object.keys(device.telemetryData).length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(device.telemetryData).map(([key, value]) => (
                  <span key={key} style={{
                    background: 'rgba(255,255,255,0.04)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    color: 'var(--text-secondary)'
                  }}>
                    {key}: <strong style={{ color: 'var(--amber-400)' }}>{String(value)}</strong>
                  </span>
                ))}
              </div>
            )}

            {/* 操作按鈕 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {device.status === 'online' && (
                <button className="btn btn-warning btn-sm" onClick={() => handleStatusChange(device.id, 'maintenance')}>
                  設為維護中
                </button>
              )}
              {device.status === 'offline' && (
                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(device.id, 'online')}>
                  設為線上
                </button>
              )}
              {device.status === 'maintenance' && (
                <button className="btn btn-success btn-sm" onClick={() => handleStatusChange(device.id, 'online')}>
                  恢復線上
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default DevicesPage
