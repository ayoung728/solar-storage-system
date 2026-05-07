import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Site, Device, WorkItem } from '../types'

function SiteDetailPage() {
  const { token } = useAuth()
  const [site, setSite] = useState<Site | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const siteId = Number(window.location.pathname.split('/')[2])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [siteData, devicesData, workItemsData] = await Promise.all([
          api.getSite(siteId, token),
          api.getDevices(token),
          api.getWorkItems({ siteId }, token),
        ])
        setSite(siteData)
        setDevices(devicesData.filter((d: Device) => d.siteId === siteId))
        setWorkItems(workItemsData)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '載入失敗')
      } finally {
        setLoading(false)
      }
    }
    if (siteId) load()
  }, [siteId, token])

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'active': return '運轉中'
      case 'constructing': return '建置中'
      case 'inactive': return '停機'
      default: return s
    }
  }

  if (loading) return <div className="loading"><div className="loading-spinner" /><span>載入案場資料...</span></div>
  if (error) return <><div className="page-header"><h2>☀️ 案場詳情</h2></div><div className="error">{error}</div></>
  if (!site) return <><div className="page-header"><h2>☀️ 案場詳情</h2></div><div className="error">找不到案場</div></>

  return (
    <>
      <div className="page-header">
        <div>
          <h2>☀️ {site.name}</h2>
          <code style={{ color: 'var(--amber-400)', fontSize: 13 }}>{site.code}</code>
        </div>
        <div className="page-actions">
          <a href="/sites" className="btn btn-outline">← 返回列表</a>
        </div>
      </div>

      {/* 摘要卡片 */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card info">
          <div className="stat-label">📦 設備數</div>
          <div className="stat-value">{devices.length}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">⚡ 總容量</div>
          <div className="stat-value">{site.capacityKwp || '-'}</div>
          <div className="stat-detail">kWp</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">📥 待處理事項</div>
          <div className="stat-value">{workItems.filter(w => w.status === 'in_pool' || w.status === 'assigned').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📅 安裝日期</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{site.installedDate || '-'}</div>
        </div>
      </div>

      {/* 基本資料 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="chart-container">
          <h3>📋 基本資料</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="summary-item"><span className="label">所屬客戶</span><span className="value">{site.customer?.name || '-'}</span></div>
            <div className="summary-item"><span className="label">案場種類</span><span className="value">{site.siteType}</span></div>
            <div className="summary-item"><span className="label">狀態</span><span className={`status-badge ${site.status}`}>{getStatusLabel(site.status)}</span></div>
            <div className="summary-item"><span className="label">地址</span><span className="value">{site.address || '-'}</span></div>
          </div>
        </div>
        <div className="chart-container">
          <h3>📍 位置</h3>
          {site.latitude && site.longitude ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{ fontSize: 48 }}>🗺️</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {site.latitude}, {site.longitude}
              </div>
              <a
                href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                在 Google Maps 開啟
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>無座標資料</div>
          )}
        </div>
      </div>

      {/* 設備列表 */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🔌 設備列表（{devices.length}）</h3>
      <div className="data-table-wrapper" style={{ marginBottom: 28 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>名稱</th>
              <th>類型</th>
              <th>廠牌</th>
              <th>型號</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id}>
                <td><code style={{ color: 'var(--amber-400)', fontSize: 12 }}>{d.code || '-'}</code></td>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {d.type === 'solar_panel' ? '太陽能板' : d.type === 'battery' ? '電池' : d.type === 'inverter' ? '逆變器' : '監控'}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.manufacturer || '-'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{d.model || '-'}</td>
                <td><span className={`status-badge ${d.status}`}>{d.status === 'online' ? '在線' : d.status === 'offline' ? '離線' : '維護中'}</span></td>
                <td><a href={`/devices/${d.id}`} className="btn btn-outline btn-sm">檢視</a></td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>尚無設備</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 待處理事項 */}
      {workItems.filter(w => w.status === 'in_pool' || w.status === 'assigned').length > 0 && (
        <>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📥 待處理事項</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {workItems.filter(w => w.status === 'in_pool' || w.status === 'assigned').map(wi => (
              <div key={wi.id} className={`alert-item ${wi.priority === 'critical' || wi.priority === 'high' ? 'critical' : 'info'}`}>
                <div className="alert-content">
                  <div className="alert-title">{wi.title}</div>
                  <div className="alert-meta">
                    <span>優先級: {wi.priority}</span>
                    <span>來源: {wi.sourceType}</span>
                    <span>狀態: {wi.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default SiteDetailPage
