import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Site, Customer } from '../types'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

function SitesPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [sites, setSites] = useState<Site[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCustomer, setFilterCustomer] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    customerId: 0, name: '', siteType: '屋頂型', address: '',
    latitude: '', longitude: '', capacityKwp: '', installedDate: '', status: 'active'
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [s, c] = await Promise.all([
        api.getSites(filterCustomer ? Number(filterCustomer) : undefined, undefined, token),
        api.getCustomers(undefined, token),
      ])
      setSites(s)
      setCustomers(c)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [token, filterCustomer])

  const handleCreate = async () => {
    try {
      await api.createSite({
        customerId: formData.customerId,
        name: formData.name,
        siteType: formData.siteType,
        address: formData.address || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        capacityKwp: formData.capacityKwp ? Number(formData.capacityKwp) : undefined,
        installedDate: formData.installedDate || undefined,
        status: formData.status as any,
      }, token)
      showToast('案場已建立', 'success')
      setShowModal(false)
      loadData()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '建立失敗', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除此案場？')) return
    try {
      await api.deleteSite(id, token)
      showToast('案場已刪除', 'success')
      loadData()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '刪除失敗', 'error')
    }
  }

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'active': return '運轉中'
      case 'constructing': return '建置中'
      case 'inactive': return '停機'
      default: return s
    }
  }

  const getTypeIcon = (t: string) => {
    switch (t) {
      case '屋頂型': return '🏢'
      case '地面型': return '🏞️'
      case '水面型': return '🌊'
      case '車棚型': return '🚗'
      default: return '☀️'
    }
  }

  if (loading && !sites.length) {
    return <div className="loading"><div className="loading-spinner" /><span>載入案場資料...</span></div>
  }

  return (
    <>
      <div className="page-header">
        <h2>☀️ 案場總覽</h2>
        <div className="page-actions">
          <select
            style={{ padding: '9px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 13 }}
            value={filterCustomer}
            onChange={e => setFilterCustomer(e.target.value)}
          >
            <option value="">全部客戶</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => {
            setFormData({ customerId: customers[0]?.id || 0, name: '', siteType: '屋頂型', address: '', latitude: '', longitude: '', capacityKwp: '', installedDate: '', status: 'active' })
            setShowModal(true)
          }}>+ 新增案場</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {sites.map(site => (
          <div key={site.id} className="chart-container" style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/sites/${site.id}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{getTypeIcon(site.siteType)}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{site.name}</div>
                <code style={{ color: 'var(--amber-400)', fontSize: 12 }}>{site.code}</code>
              </div>
              <span className={`status-badge ${site.status}`}>{getStatusLabel(site.status)}</span>
            </div>
            <div className="alert-meta" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>🏢 {site.customer?.name || '未知客戶'}</span>
              <span>📍 {site.address || '無地址'}</span>
              <span>⚡ 容量: {site.capacityKwp ? `${site.capacityKwp} kWp` : '-'}</span>
              <span>📅 安裝: {site.installedDate || '-'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <a href={`/sites/${site.id}`} className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>檢視詳情</a>
              <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(site.id) }}>刪除</button>
            </div>
          </div>
        ))}
        {sites.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>暫無案場資料</div>
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title="新增案場">
          <div className="form">
            <div className="form-field">
              <label>所屬客戶 *</label>
              <select value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: Number(e.target.value) })}>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>案場名稱 *</label>
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="例：內湖科技廠屋頂太陽能" />
            </div>
            <div className="form-field">
              <label>案場種類</label>
              <select value={formData.siteType} onChange={e => setFormData({ ...formData, siteType: e.target.value })}>
                <option>屋頂型</option>
                <option>地面型</option>
                <option>水面型</option>
                <option>車棚型</option>
                <option>其他</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-field">
                <label>經度</label>
                <input value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} placeholder="121.575" />
              </div>
              <div className="form-field">
                <label>緯度</label>
                <input value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} placeholder="25.078" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-field">
                <label>容量 (kWp)</label>
                <input type="number" value={formData.capacityKwp} onChange={e => setFormData({ ...formData, capacityKwp: e.target.value })} placeholder="500" />
              </div>
              <div className="form-field">
                <label>安裝日期</label>
                <input type="date" value={formData.installedDate} onChange={e => setFormData({ ...formData, installedDate: e.target.value })} />
              </div>
            </div>
            <div className="form-field">
              <label>地址</label>
              <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={!formData.name || !formData.customerId}>建立</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default SitesPage
