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
      case 'online': return <span className="badge status-online">🟢 線上</span>
      case 'offline': return <span className="badge status-offline">🔴 離線</span>
      case 'maintenance': return <span className="badge status-maintenance">🔧 維護中</span>
      case 'warning': return <span className="badge status-warning">⚠️ 警告</span>
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
      <div className="page">
        <h2>設備管理</h2>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h2>設備管理</h2>
        <div className="error">❌ {error}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>設備管理</h2>

      {/* 統計摘要 */}
      {stats && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="label">總數</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="label">線上</span>
            <span className="value">{stats.online}</span>
          </div>
          <div className="stat-item">
            <span className="label">離線</span>
            <span className="value">{stats.offline}</span>
          </div>
          <div className="stat-item">
            <span className="label">維護中</span>
            <span className="value">{stats.maintenance}</span>
          </div>
          <div className="stat-item">
            <span className="label">警告</span>
            <span className="value">{stats.warning}</span>
          </div>
        </div>
      )}

      {/* 篩選器 */}
      <div className="filter-bar">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({devices.length})
        </button>
        <button
          className={`btn ${filter === 'online' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('online')}
        >
          線上 ({devices.filter(d => d.status === 'online').length})
        </button>
        <button
          className={`btn ${filter === 'offline' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('offline')}
        >
          離線 ({devices.filter(d => d.status === 'offline').length})
        </button>
        <button
          className={`btn ${filter === 'maintenance' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('maintenance')}
        >
          維護中 ({devices.filter(d => d.status === 'maintenance').length})
        </button>
      </div>

      {/* 設備列表 */}
      <div className="devices-list">
        {filteredDevices.map(device => (
          <div key={device.id} className="device-card">
            <div className="card-header">
              <h3>{device.name}</h3>
              {getStatusBadge(device.status)}
            </div>
            <div className="card-body">
              <p><strong>設備編號：</strong>{device.deviceId}</p>
              <p><strong>類型：</strong>{getTypeLabel(device.type)}</p>
              {device.location && <p><strong>位置：</strong>{device.location}</p>}
              {device.manufacturer && <p><strong>廠牌：</strong>{device.manufacturer}</p>}
              {device.model && <p><strong>型號：</strong>{device.model}</p>}
              {device.firmwareVersion && <p><strong>韌體版本：</strong>{device.firmwareVersion}</p>}
              {device.serialNumber && <p><strong>序號：</strong>{device.serialNumber}</p>}
              {device.installedDate && <p><strong>安裝日期：</strong>{device.installedDate}</p>}
              {device.lastMaintenanceDate && <p><strong>最後維護：</strong>{device.lastMaintenanceDate}</p>}

              {/* 即時數據 */}
              {device.telemetryData && Object.keys(device.telemetryData).length > 0 && (
                <div className="telemetry-section">
                  <p><strong>即時數據：</strong></p>
                  {Object.entries(device.telemetryData).map(([key, value]) => (
                    <span key={key} className="telemetry-item">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="card-actions">
              {device.status === 'online' && (
                <>
                  <button className="btn btn-warning" onClick={() => handleStatusChange(device.id, 'maintenance')}>
                    設為維護中
                  </button>
                </>
              )}
              {device.status === 'offline' && (
                <>
                  <button className="btn btn-success" onClick={() => handleStatusChange(device.id, 'online')}>
                    設為線上
                  </button>
                </>
              )}
              {device.status === 'maintenance' && (
                <>
                  <button className="btn btn-success" onClick={() => handleStatusChange(device.id, 'online')}>
                    恢復線上
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 新增設備按鈕 */}
      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => alert('新增設備功能開發中')}>
          + 新增設備
        </button>
      </div>
    </div>
  )
}

export default DevicesPage
