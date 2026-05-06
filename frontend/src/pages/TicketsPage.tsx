import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Ticket, TicketStats } from '../types'

function TicketsPage() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true)
        setError(null)
        const [ticketsData, statsData] = await Promise.all([
          api.getTickets(undefined, token),
          api.getTicketStats(token),
        ])
        setTickets(ticketsData)
        setStats(statsData)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '載入工單資料失敗'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [token])

  const filteredTickets = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter)

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateTicket(id, { status: newStatus as Ticket['status'] }, token)
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as Ticket['status'] } : t))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新狀態失敗'
      setError(message)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'open': return <span className="badge status-open">🔵 待處理</span>
      case 'in_progress': return <span className="badge status-inprogress">🟡 處理中</span>
      case 'resolved': return <span className="badge status-resolved">🟢 已解決</span>
      case 'closed': return <span className="badge status-closed">⚫ 已關閉</span>
      default: return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': return <span className="badge priority-critical">🔴 緊急</span>
      case 'high': return <span className="badge priority-high">🟠 高</span>
      case 'medium': return <span className="badge priority-medium">🟡 中</span>
      case 'low': return <span className="badge priority-low">🟢 低</span>
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="page">
        <h2>工單系統</h2>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <h2>工單系統</h2>
        <div className="error">❌ {error}</div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>工單系統</h2>

      {/* 統計摘要 */}
      {stats && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="label">總數</span>
            <span className="value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="label">待處理</span>
            <span className="value">{stats.open}</span>
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
            <span className="label">已關閉</span>
            <span className="value">{stats.closed}</span>
          </div>
        </div>
      )}

      {/* 篩選器 */}
      <div className="filter-bar">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({tickets.length})
        </button>
        <button
          className={`btn ${filter === 'open' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('open')}
        >
          待處理 ({tickets.filter(t => t.status === 'open').length})
        </button>
        <button
          className={`btn ${filter === 'in_progress' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          處理中 ({tickets.filter(t => t.status === 'in_progress').length})
        </button>
        <button
          className={`btn ${filter === 'resolved' ? 'btn-primary' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          已解決 ({tickets.filter(t => t.status === 'resolved').length})
        </button>
      </div>

      {/* 工單列表 */}
      <div className="tickets-list">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <h3>{ticket.title}</h3>
              <div className="badges">
                {getPriorityBadge(ticket.priority)}
                {getStatusBadge(ticket.status)}
              </div>
            </div>
            <p className="ticket-description">{ticket.description}</p>
            <div className="ticket-meta">
              {ticket.deviceName && (
                <span className="device-tag">{ticket.deviceName}</span>
              )}
              <span className="assignee">👤 {ticket.assignee || '未指派'}</span>
              <span className="dates">
                建立：{new Date(ticket.createdAt).toLocaleString('zh-TW')} | 更新：{new Date(ticket.updatedAt).toLocaleString('zh-TW')}
              </span>
            </div>
            <div className="ticket-actions">
              {ticket.status === 'open' && (
                <>
                  <button className="btn btn-primary" onClick={() => handleStatusChange(ticket.id, 'in_progress')}>
                    接受工單
                  </button>
                </>
              )}
              {ticket.status === 'in_progress' && (
                <>
                  <button className="btn btn-success" onClick={() => handleStatusChange(ticket.id, 'resolved')}>
                    標記解決
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="empty-state">
          <p>目前沒有工單 📋</p>
        </div>
      )}

      {/* 新增工單按鈕 */}
      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => alert('新增工單功能開發中')}>
          + 新增工單
        </button>
      </div>
    </div>
  )
}

export default TicketsPage
