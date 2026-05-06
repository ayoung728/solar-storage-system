import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { MaintenanceRecord, MaintenanceStats } from '../types'

function MaintenancePage() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<MaintenanceRecord[]>([])
  const [stats, setStats] = useState<MaintenanceStats | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMaintenance() {
      try {
        setLoading(true)
        setError(null)
        const [tasksData, statsData] = await Promise.all([
          api.getMaintenance(token),
          api.getMaintenanceStats(token),
        ])
        setTasks(tasksData)
        setStats(statsData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '載入維護資料失敗'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadMaintenance()
  }, [token])

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status.toLowerCase().replace(/_/g, '-') === filter)

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateMaintenanceStatus(id, newStatus, token)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as MaintenanceRecord['status'] } : t))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新狀態失敗'
      setError(message)
    }
  }

  const handleComplete = async (id: number) => {
    const actualCost = prompt('請輸入實際費用（可留空）：')
    const notes = prompt('請輸入備註（可留空）：')

    try {
      const completionData: { actualCost?: number; notes?: string } = {}
      if (actualCost && actualCost.trim()) {
        completionData.actualCost = parseFloat(actualCost)
      }
      if (notes && notes.trim()) {
        completionData.notes = notes
      }

      await api.completeMaintenance(id, completionData, token)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'COMPLETED' as MaintenanceRecord['status'], completedDate: new Date().toISOString(), ...completionData } : t))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '完成維護失敗'
      setError(message)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status.toUpperCase()) {
      case 'PENDING': return <span className="badge status-pending">⏳ 待執行</span>
      case 'SCHEDULED': return <span className="badge status-scheduled">📅 已排程</span>
      case 'IN_PROGRESS': return <span className="badge status-inprogress">🔄 進行中</span>
      case 'COMPLETED': return <span className="badge status-completed">✅ 已完成</span>
      case 'CANCELLED': return <span className="badge status-cancelled">❌ 已取消</span>
      default: return null
    }
  }

  const getTaskTypeLabel = (type: string) => {
    switch(type) {
      case 'routine': return '定期維護'
      case 'repair': return '維修保養'
      case 'inspection': return '檢查檢測'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h2>維護管理</h2>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h2>維護管理</h2>
        <div className="error">❌ {error}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>維護管理</h2>

      {/* 統計摘要 */}
      {stats && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="label">總數</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="label">待執行</span>
            <span className="value">{stats.pending}</span>
          </div>
          <div className="stat-item">
            <span className="label">進行中</span>
            <span className="value">{stats.inProgress}</span>
          </div>
          <div className="stat-item">
            <span className="label">已完成</span>
            <span className="value">{stats.completed}</span>
          </div>
          <div className="stat-item">
            <span className="label">已取消</span>
            <span className="value">{stats.cancelled}</span>
          </div>
        </div>
      )}

      {/* 篩選器 */}
      <div className="filter-bar">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({tasks.length})
        </button>
        <button
          className={`btn ${filter === 'pending' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('pending')}
        >
          待執行 ({tasks.filter(t => t.status === 'PENDING').length})
        </button>
        <button
          className={`btn ${filter === 'in_progress' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          進行中 ({tasks.filter(t => t.status === 'IN_PROGRESS').length})
        </button>
        <button
          className={`btn ${filter === 'completed' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('completed')}
        >
          已完成 ({tasks.filter(t => t.status === 'COMPLETED').length})
        </button>
      </div>

      {/* 維護任務列表 */}
      <div className="maintenance-list">
        {filteredTasks.map(task => (
          <div key={task.id} className="maintenance-card">
            <div className="card-header">
              <h3>{task.deviceName || '未指定設備'}</h3>
              {getStatusBadge(task.status)}
            </div>
            <div className="card-body">
              <p><strong>任務類型：</strong>{getTaskTypeLabel(task.taskType)}</p>
              <p><strong>預定日期：</strong>{new Date(task.scheduledDate).toLocaleDateString('zh-TW')}</p>
              <p><strong>負責人員：</strong>{task.technician || '未指派'}</p>
              <p><strong>預估工時：</strong>{task.estimatedDuration} 小時</p>
              {task.notes && <p><strong>備註：</strong>{task.notes}</p>}
              {task.actualCost && <p><strong>實際費用：</strong>${task.actualCost}</p>}
              {task.completedDate && <p><strong>完成日期：</strong>{new Date(task.completedDate).toLocaleDateString('zh-TW')}</p>}
            </div>
            <div className="card-actions">
              {task.status === 'PENDING' && (
                <>
                  <button className="btn btn-primary" onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>
                    開始執行
                  </button>
                  <button className="btn btn-danger" onClick={() => handleStatusChange(task.id, 'CANCELLED')}>
                    取消
                  </button>
                </>
              )}
              {task.status === 'IN_PROGRESS' && (
                <>
                  <button className="btn btn-success" onClick={() => handleComplete(task.id)}>
                    標記完成
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <p>目前沒有維護任務 📋</p>
        </div>
      )}

      {/* 新增維護任務按鈕 */}
      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => alert('新增維護任務功能開發中')}>
          + 新增維護任務
        </button>
      </div>
    </div>
  )
}

export default MaintenancePage
