import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { DeviceStats, AlertStats, TicketStats, MaintenanceStats } from '../types'
import { BarChart, LineChart, PieChart } from '../components/Charts'

function DashboardPage() {
  const { token } = useAuth()
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null)
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null)
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null)
  const [maintenanceStats, setMaintenanceStats] = useState<MaintenanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true)
        setError(null)
        const [devices, alerts, tickets, maintenance] = await Promise.all([
          api.getDeviceStats(token),
          api.getAlertStats(token),
          api.getTicketStats(token),
          api.getMaintenanceStats(token),
        ])

        setDeviceStats(devices)
        setAlertStats(alerts)
        setTicketStats(tickets)
        setMaintenanceStats(maintenance)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '載入儀表板資料失敗'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [token])

  if (loading) {
    return (
      <div className="page">
        <h2>儀表板</h2>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h2>儀表板</h2>
        <div className="error">❌ {error}</div>
      </div>
    )
  }

  const totalDevices = deviceStats?.total || 0
  const onlineDevices = deviceStats?.online || 0
  const offlineDevices = deviceStats?.offline || 0
  const criticalAlerts = alertStats?.critical || 0
  const openTickets = ticketStats?.open || 0
  const pendingMaintenance = maintenanceStats?.pending || 0

  // 圖表資料準備
  const deviceTypeChartData = [
    { label: '太陽能板', value: deviceStats?.solarPanels || 0 },
    { label: '電池儲能', value: deviceStats?.batteryStorage || 0 },
    { label: '逆變器', value: deviceStats?.inverters || 0 },
    { label: '監控系統', value: deviceStats?.monitoringSystems || 0 },
  ]

  const alertSeverityChartData = [
    { label: '嚴重', value: criticalAlerts },
    { label: '警告', value: alertStats?.warning || 0 },
    { label: '資訊', value: alertStats?.info || 0 },
  ]

  const ticketStatusChartData = [
    { label: '待處理', value: openTickets },
    { label: '處理中', value: ticketStats?.inProgress || 0 },
    { label: '已解決', value: ticketStats?.resolved || 0 },
    { label: '已關閉', value: ticketStats?.closed || 0 },
  ]

  const maintenanceChartData = [
    { label: '待執行', value: pendingMaintenance },
    { label: '進行中', value: maintenanceStats?.inProgress || 0 },
    { label: '已完成', value: maintenanceStats?.completed || 0 },
  ]

  const onlineRate = totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0
  const alertResolutionRate = alertStats?.total ? Math.round(((alertStats.total - (alertStats.open || 0)) / alertStats.total) * 100) : 0
  const ticketCompletionRate = ticketStats?.total ? Math.round(((ticketStats.resolved || 0 + ticketStats.closed || 0) / ticketStats.total) * 100) : 0
  const maintenanceCompletionRate = maintenanceStats?.total ? Math.round((maintenanceStats.completed / maintenanceStats.total) * 100) : 0

  return (
    <div className="page">
      <h2>儀表板</h2>

      {/* 統計卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>設備總數</h3>
          <div className="stat-value">{totalDevices}</div>
          <div className="stat-detail">
            線上: {onlineDevices} | 離線: {offlineDevices}
          </div>
        </div>

        <div className="stat-card warning">
          <h3>警報數量</h3>
          <div className="stat-value">{alertStats?.total || 0}</div>
          <div className="stat-detail">
            嚴重: {criticalAlerts} | 未處理: {alertStats?.open || 0}
          </div>
        </div>

        <div className="stat-card info">
          <h3>待處理工單</h3>
          <div className="stat-value">{openTickets}</div>
          <div className="stat-detail">
            處理中: {ticketStats?.inProgress || 0} | 已解決: {ticketStats?.resolved || 0}
          </div>
        </div>

        <div className="stat-card success">
          <h3>維護任務</h3>
          <div className="stat-value">{pendingMaintenance}</div>
          <div className="stat-detail">
            進行中: {maintenanceStats?.inProgress || 0} | 已完成: {maintenanceStats?.completed || 0}
          </div>
        </div>
      </div>

      {/* 圖表區 */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>設備類型分佈</h3>
          <BarChart data={deviceTypeChartData} />
        </div>

        <div className="chart-container">
          <h3>警報嚴重程度</h3>
          <PieChart data={alertSeverityChartData} />
        </div>

        <div className="chart-container">
          <h3>工單狀態分佈</h3>
          <BarChart data={ticketStatusChartData} />
        </div>

        <div className="chart-container">
          <h3>維護進度</h3>
          <PieChart data={maintenanceChartData} />
        </div>
      </div>

      {/* 系統狀態摘要 */}
      <div className="system-summary">
        <h3>系統狀態摘要</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">設備線上率：</span>
            <span className="value">{onlineRate}%</span>
          </div>
          <div className="summary-item">
            <span className="label">警報處理率：</span>
            <span className="value">{alertResolutionRate}%</span>
          </div>
          <div className="summary-item">
            <span className="label">工單完成率：</span>
            <span className="value">{ticketCompletionRate}%</span>
          </div>
          <div className="summary-item">
            <span className="label">維護完成率：</span>
            <span className="value">{maintenanceCompletionRate}%</span>
          </div>
        </div>

        {/* 進度條 */}
        <div className="progress-bars">
          <div className="progress-item">
            <span>設備線上率</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${onlineRate}%` }} />
            </div>
            <span>{onlineRate}%</span>
          </div>
          <div className="progress-item">
            <span>警報處理率</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${alertResolutionRate}%` }} />
            </div>
            <span>{alertResolutionRate}%</span>
          </div>
          <div className="progress-item">
            <span>工單完成率</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${ticketCompletionRate}%` }} />
            </div>
            <span>{ticketCompletionRate}%</span>
          </div>
          <div className="progress-item">
            <span>維護完成率</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${maintenanceCompletionRate}%` }} />
            </div>
            <span>{maintenanceCompletionRate}%</span>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="quick-actions">
        <h3>快速操作</h3>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => window.location.hash = '#/devices'}>
            查看設備列表
          </button>
          <button className="btn btn-warning" onClick={() => window.location.hash = '#/alerts'}>
            查看警報中心
          </button>
          <button className="btn btn-info" onClick={() => window.location.hash = '#/tickets'}>
            查看工單系統
          </button>
          <button className="btn btn-success" onClick={() => window.location.hash = '#/maintenance'}>
            查看維護管理
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
