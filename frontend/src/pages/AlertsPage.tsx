import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Alert, AlertStats } from '../types'

function AlertsPage() {
  const { token } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<AlertStats | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true)
        setError(null)
        const [alertsData, statsData] = await Promise.all([
          api.getAlerts(token),
          api.getAlertStats(token),
        ])
        setAlerts(alertsData)
        setStats(statsData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '載入警報資料失敗'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [token])

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(a => a.status === filter)

  const handleAcknowledge = async (id: number) => {
    try {
      await api.updateAlertStatus(id, 'acknowledged', token)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' as Alert['status'] } : a))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '確認處理失敗'
      setError(message)
    }
  }

  const handleResolve = async (id: number) => {
    try {
      await api.updateAlertStatus(id, 'resolved', token)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' as Alert['status'] } : a))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '標記解決失敗'
      setError(message)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return <span className="badge status-open">🔵 未處理</span>
      case 'acknowledged': return <span className="badge status-acknowledged">🟡 已確認</span>
      case 'in_progress': return <span className="badge status-inprogress">🟠 處理中</span>
      case 'resolved': return <span className="badge status-resolved">🟢 已解決</span>
      case 'closed': return <span className="badge status-closed">⚫ 已關閉</span>
      default: return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'low': return <span className="badge severity-low">ℹ️ 低</span>
      case 'medium': return <span className="badge severity-medium">⚠️ 中</span>
      case 'high': return <span className="badge severity-high">🔶 高</span>
      case 'critical': return <span className="badge severity-critical">🔴 嚴重</span>
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h2>警報中心</h2>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h2>警報中心</h2>
        <div className="error">❌ {error}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>警報中心</h2>

      {/* 統計摘要 */}
      {stats && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="label">總數</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="label">未處理</span>
            <span className="value">{stats.open}</span>
          </div>
          <div className="stat-item">
            <span className="label">已確認</span>
            <span className="value">{stats.acknowledged}</span>
          </div>
          <div className="stat-item">
            <span className="label">處理中</span>
            <span className="value">{stats.inProgress}</span>
          </div>
          <div className="stat-item">
            <span className="label">已解決</span>
            <span className="value">{stats.resolved}</span>
          </div>
          <div className="stat-item">
            <span className="label">嚴重</span>
            <span className="value">{stats.critical}</span>
          </div>
        </div>
      )}

      {/* 篩選器 */}
      <div className="filter-bar">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({alerts.length})
        </button>
        <button
          className={`btn ${filter === 'open' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('open')}
        >
          未處理 ({alerts.filter(a => a.status === 'open').length})
        </button>
        <button
          className={`btn ${filter === 'acknowledged' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('acknowledged')}
        >
          已確認 ({alerts.filter(a => a.status === 'acknowledged').length})
        </button>
        <button
          className={`btn ${filter === 'in_progress' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          處理中 ({alerts.filter(a => a.status === 'in_progress').length})
        </button>
      </div>

      {/* 警報列表 */}
      <div className="alerts-list">
        {filteredAlerts.map(alert => (
          <div key={alert.id} className="alert-card">
            <div className="alert-header">
              {getSeverityBadge(alert.severity)}
              {alert.deviceName && <span className="device-id">{alert.deviceName}</span>}
              <span className="timestamp">{new Date(alert.createdAt).toLocaleString('zh-TW')}</span>
            </div>
            <p className="alert-message">{alert.message}</p>
            <div className="alert-footer">
              {getStatusBadge(alert.status)}
              {alert.status === 'open' && (
                <button className="btn btn-sm btn-primary" onClick={() => handleAcknowledge(alert.id)}>
                  確認處理
                </button>
              )}
              {alert.status === 'acknowledged' && (
                <button className="btn btn-sm btn-success" onClick={() => handleResolve(alert.id)}>
                  標記解決
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="empty-state">
          <p>目前沒有警報 🎉</p>
        </div>
      )}
    </div>
  )
}

export default AlertsPage
