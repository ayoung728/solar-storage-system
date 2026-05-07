import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Device, Unit, Site } from '../types'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

function DeviceDetailPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [device, setDevice] = useState<Device | null>(null)
  const [site, setSite] = useState<Site | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [editUnit, setEditUnit] = useState<Unit | null>(null)
  const [unitForm, setUnitForm] = useState({ name: '', unitType: 'cooling_fan', code: '', specifications: '' })

  const deviceId = Number(window.location.pathname.split('/')[2])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const d = await api.getDevice(deviceId, token)
        setDevice(d)

        if (d.siteId) {
          try {
            const s = await api.getSite(d.siteId, token)
            setSite(s)
          } catch { /* site may not load */ }
        }

        const u = await api.getDeviceUnits(deviceId, token)
        setUnits(u)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '載入失敗')
      } finally {
        setLoading(false)
      }
    }
    if (deviceId) load()
  }, [deviceId, token])

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'online': return '線上'
      case 'offline': return '離線'
      case 'maintenance': return '維護中'
      case 'warning': return '⚠️ 警告'
      default: return s
    }
  }

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'solar_panel': return '太陽能板'
      case 'battery': return '電池儲能'
      case 'inverter': return '逆變器'
      case 'monitor': return '監控系統'
      default: return t
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.updateDeviceStatus(deviceId, newStatus, token)
      const updated = await api.getDevice(deviceId, token)
      setDevice(updated)
      showToast(`設備狀態已更新為 ${getStatusLabel(newStatus)}`, 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '更新失敗', 'error')
    }
  }

  const handleSaveUnit = async () => {
    try {
      const specs = unitForm.specifications ? JSON.parse(unitForm.specifications) : undefined
      if (editUnit) {
        await api.updateUnit(editUnit.id, { name: unitForm.name, unitType: unitForm.unitType, specifications: specs }, token)
        showToast('單元已更新', 'success')
      } else {
        await api.createUnit(deviceId, { name: unitForm.name, unitType: unitForm.unitType, code: unitForm.code || `${device?.code || 'DEV'}-${unitForm.unitType}-${units.length + 1}`, specifications: specs }, token)
        showToast('單元已建立', 'success')
      }
      setShowUnitModal(false)
      const u = await api.getDeviceUnits(deviceId, token)
      setUnits(u)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '操作失敗', 'error')
    }
  }

  const handleDeleteUnit = async (id: number) => {
    if (!confirm('確定刪除此單元？')) return
    try {
      await api.deleteUnit(id, token)
      showToast('單元已刪除', 'success')
      const u = await api.getDeviceUnits(deviceId, token)
      setUnits(u)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '刪除失敗', 'error')
    }
  }

  if (loading) {
    return <div className="loading"><div className="loading-spinner" /><span>載入設備資料...</span></div>
  }

  if (error) {
    return <><div className="page-header"><h2>🔌 設備詳情</h2></div><div className="error">{error}</div></>
  }

  if (!device) {
    return <><div className="page-header"><h2>🔌 設備詳情</h2></div><div className="error">找不到設備</div></>
  }

  return (
    <>
      <div className="page-header">
        <h2>🔌 {device.name}</h2>
        <div className="page-actions">
          <a href="/devices" className="btn btn-outline">← 返回列表</a>
          {site && <a href={`/sites/${site.id}`} className="btn btn-outline">🏢 所屬案場</a>}
          <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>編輯</button>
        </div>
      </div>

      {/* 設備基本資料 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="chart-container">
          <h3>📋 基本資料</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="summary-item"><span className="label">代號</span><span className="value">{device.code || '-'}</span></div>
            <div className="summary-item"><span className="label">類型</span><span className="value">{getTypeLabel(device.type)}</span></div>
            <div className="summary-item"><span className="label">狀態</span><span className={`status-badge ${device.status}`}>{getStatusLabel(device.status)}</span></div>
            <div className="summary-item"><span className="label">位置</span><span className="value">{device.location || '-'}</span></div>
          </div>
        </div>
        <div className="chart-container">
          <h3>🏭 廠牌型號</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="summary-item"><span className="label">廠牌</span><span className="value">{device.manufacturer || '-'}</span></div>
            <div className="summary-item"><span className="label">型號</span><span className="value">{device.model || '-'}</span></div>
            <div className="summary-item"><span className="label">序號</span><span className="value">{device.serialNumber || '-'}</span></div>
            <div className="summary-item"><span className="label">韌體</span><span className="value">{device.firmwareVersion || '-'}</span></div>
          </div>
        </div>
        <div className="chart-container">
          <h3>📅 日期</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="summary-item"><span className="label">安裝日期</span><span className="value">{device.installedDate || '-'}</span></div>
            <div className="summary-item"><span className="label">最後維護</span><span className="value">{device.lastMaintenanceDate || '-'}</span></div>
          </div>
          {site && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 4 }}>所屬案場</div>
              <a href={`/sites/${site.id}`} style={{ color: 'var(--amber-400)', fontWeight: 600, textDecoration: 'none' }}>
                ☀️ {site.name}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 即時數據 */}
      {device.telemetryData && Object.keys(device.telemetryData).length > 0 && (
        <div className="chart-container" style={{ marginBottom: 24 }}>
          <h3>📊 即時數據</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(device.telemetryData).map(([key, value]) => (
              <div key={key} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', minWidth: 120 }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{key}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber-400)' }}>{String(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 單元列表 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>🔩 組成單元（{units.length}）</h3>
        <button className="btn btn-primary btn-sm" onClick={() => {
          setEditUnit(null)
          setUnitForm({ name: '', unitType: 'cooling_fan', code: '', specifications: '' })
          setShowUnitModal(true)
        }}>+ 新增單元</button>
      </div>

      <div className="data-table-wrapper" style={{ marginBottom: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>名稱</th>
              <th>類型</th>
              <th>狀態</th>
              <th>保養項目</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {units.map(u => (
              <tr key={u.id}>
                <td><code style={{ color: 'var(--amber-400)', fontSize: 12 }}>{u.code}</code></td>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.unitType}</td>
                <td><span className={`status-badge ${u.status}`}>{u.status === 'active' ? '正常' : u.status === 'inactive' ? '停用' : '報廢'}</span></td>
                <td>
                  <a href={`/units/${u.id}`} className="btn btn-outline btn-sm">
                    查看 ({u.maintenanceItems?.length || 0})
                  </a>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      setEditUnit(u)
                      setUnitForm({ name: u.name, unitType: u.unitType, code: u.code, specifications: JSON.stringify(u.specifications || {}, null, 2) })
                      setShowUnitModal(true)
                    }}>編輯</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUnit(u.id)}>刪除</button>
                  </div>
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>尚無單元，請新增</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 操作按鈕 */}
      <div style={{ display: 'flex', gap: 10 }}>
        {device.status === 'online' && (
          <button className="btn btn-warning" onClick={() => handleStatusChange('maintenance')}>設為維護中</button>
        )}
        {device.status === 'offline' && (
          <button className="btn btn-success" onClick={() => handleStatusChange('online')}>設為線上</button>
        )}
        {device.status === 'maintenance' && (
          <button className="btn btn-success" onClick={() => handleStatusChange('online')}>恢復線上</button>
        )}
      </div>

      {/* 編輯 Modal */}
      {showEditModal && (
        <Modal onClose={() => setShowEditModal(false)} title="編輯設備">
          <div className="form">
            <div className="form-field"><label>名稱</label><input defaultValue={device.name} /></div>
            <div className="form-field"><label>位置</label><input defaultValue={device.location || ''} placeholder="安裝位置" /></div>
            <div className="form-field"><label>廠牌</label><input defaultValue={device.manufacturer || ''} /></div>
            <div className="form-field"><label>型號</label><input defaultValue={device.model || ''} /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => { showToast('編輯功能開發中', 'info'); setShowEditModal(false) }}>儲存</button>
            </div>
          </div>
        </Modal>
      )}

      {/* 單元 Modal */}
      {showUnitModal && (
        <Modal onClose={() => setShowUnitModal(false)} title={editUnit ? '編輯單元' : '新增單元'}>
          <div className="form">
            <div className="form-field">
              <label>單元名稱 *</label>
              <input value={unitForm.name} onChange={e => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="散熱風扇模組 A" />
            </div>
            <div className="form-field">
              <label>類型</label>
              <select value={unitForm.unitType} onChange={e => setUnitForm({ ...unitForm, unitType: e.target.value })}>
                <option value="cooling_fan">散熱風扇</option>
                <option value="capacitor_bank">電容模組</option>
                <option value="control_board">控制板</option>
                <option value="bms">電池管理系統</option>
                <option value="sensor">感測器</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div className="form-field">
              <label>代號（留空自動產生）</label>
              <input value={unitForm.code} onChange={e => setUnitForm({ ...unitForm, code: e.target.value })} placeholder={`${device?.code || 'DEV'}-FAN-01`} />
            </div>
            <div className="form-field">
              <label>規格（JSON）</label>
              <textarea value={unitForm.specifications} onChange={e => setUnitForm({ ...unitForm, specifications: e.target.value })} rows={4} placeholder='{"type": "axial", "rpm": 3000}' />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowUnitModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSaveUnit} disabled={!unitForm.name}>{editUnit ? '更新' : '建立'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default DeviceDetailPage
