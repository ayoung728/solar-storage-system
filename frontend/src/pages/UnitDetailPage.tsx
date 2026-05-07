import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Unit, MaintenanceItem, MaintenanceStep, AcceptanceCriterion } from '../types'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

function UnitDetailPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editItem, setEditItem] = useState<MaintenanceItem | null>(null)
  const [itemForm, setItemForm] = useState({
    name: '', frequencyType: 'quarterly' as MaintenanceItem['frequencyType'],
    frequencyValue: 1, estimatedMinutes: 30, steps: '', acceptanceCriteria: ''
  })

  const unitId = Number(window.location.pathname.split('/')[2])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [u, mi] = await Promise.all([
          api.getUnit(unitId, token),
          api.getUnitMaintenanceItems(unitId, token),
        ])
        setUnit(u)
        setItems(mi)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '載入失敗')
      } finally {
        setLoading(false)
      }
    }
    if (unitId) load()
  }, [unitId, token])

  const openCreate = () => {
    setEditItem(null)
    setItemForm({ name: '', frequencyType: 'quarterly', frequencyValue: 1, estimatedMinutes: 30, steps: '', acceptanceCriteria: '' })
    setShowItemModal(true)
  }

  const openEdit = (item: MaintenanceItem) => {
    setEditItem(item)
    setItemForm({
      name: item.name,
      frequencyType: item.frequencyType,
      frequencyValue: item.frequencyValue,
      estimatedMinutes: item.estimatedMinutes || 30,
      steps: JSON.stringify(item.steps || [], null, 2),
      acceptanceCriteria: JSON.stringify(item.acceptanceCriteria || [], null, 2),
    })
    setShowItemModal(true)
  }

  const handleSaveItem = async () => {
    try {
      const steps = itemForm.steps ? JSON.parse(itemForm.steps) : []
      const criteria = itemForm.acceptanceCriteria ? JSON.parse(itemForm.acceptanceCriteria) : []

      const payload = {
        name: itemForm.name,
        frequencyType: itemForm.frequencyType,
        frequencyValue: itemForm.frequencyValue,
        estimatedMinutes: itemForm.estimatedMinutes,
        steps,
        acceptanceCriteria: criteria,
      }

      if (editItem) {
        await api.updateMaintenanceItem(editItem.id, payload, token)
        showToast('保養項目已更新', 'success')
      } else {
        await api.createMaintenanceItem(unitId, payload, token)
        showToast('保養項目已建立', 'success')
      }
      setShowItemModal(false)
      const mi = await api.getUnitMaintenanceItems(unitId, token)
      setItems(mi)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '操作失敗', 'error')
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (!confirm('確定刪除此保養項目？')) return
    try {
      await api.deleteMaintenanceItem(id, token)
      showToast('保養項目已刪除', 'success')
      const mi = await api.getUnitMaintenanceItems(unitId, token)
      setItems(mi)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '刪除失敗', 'error')
    }
  }

  const getFreqLabel = (t: string, v: number) => {
    switch (t) {
      case 'weekly': return `每 ${v} 週`
      case 'monthly': return `每 ${v} 個月`
      case 'quarterly': return `每 ${v} 季`
      case 'half_yearly': return `每 ${v} 半年`
      case 'yearly': return `每 ${v} 年`
      default: return `${t} ${v}`
    }
  }

  if (loading) return <div className="loading"><div className="loading-spinner" /><span>載入單元資料...</span></div>
  if (error) return <><div className="page-header"><h2>🔩 單元詳情</h2></div><div className="error">{error}</div></>
  if (!unit) return <><div className="page-header"><h2>🔩 單元詳情</h2></div><div className="error">找不到單元</div></>

  return (
    <>
      <div className="page-header">
        <div>
          <h2>🔩 {unit.name}</h2>
          <code style={{ color: 'var(--amber-400)', fontSize: 13 }}>{unit.code}</code>
        </div>
        <div className="page-actions">
          <a href={`/devices/${unit.deviceId}`} className="btn btn-outline">← 所屬設備</a>
        </div>
      </div>

      {/* 單元資訊 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="chart-container">
          <h3>📋 基本資料</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="summary-item"><span className="label">名稱</span><span className="value">{unit.name}</span></div>
            <div className="summary-item"><span className="label">類型</span><span className="value">{unit.unitType}</span></div>
            <div className="summary-item"><span className="label">狀態</span><span className={`status-badge ${unit.status}`}>{unit.status === 'active' ? '正常' : unit.status === 'inactive' ? '停用' : '報廢'}</span></div>
          </div>
        </div>
        <div className="chart-container">
          <h3>📐 規格</h3>
          {unit.specifications && Object.keys(unit.specifications).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(unit.specifications).map(([k, v]) => (
                <div key={k} className="summary-item">
                  <span className="label">{k}</span>
                  <span className="value">{String(v)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>無規格資料</div>
          )}
        </div>
      </div>

      {/* 保養項目列表 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>📋 保養項目（{items.length}）</h3>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ 新增保養項目</button>
      </div>

      {items.map(item => (
        <div key={item.id} className="chart-container" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
              <div className="alert-meta" style={{ marginTop: 4 }}>
                <span>🔄 {getFreqLabel(item.frequencyType, item.frequencyValue)}</span>
                <span>⏱ {item.estimatedMinutes || '-'} 分鐘</span>
                <span>{item.isActive ? '✅ 啟用' : '⛔ 停用'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>編輯</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteItem(item.id)}>刪除</button>
            </div>
          </div>

          {/* 保養步驟 */}
          {item.steps && (item.steps as MaintenanceStep[]).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>📝 SOP 步驟</div>
              {(item.steps as MaintenanceStep[]).map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, marginBottom: 4 }}>
                  <span style={{ color: 'var(--amber-400)', fontWeight: 700, minWidth: 24 }}>{step.order}.</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{step.description}</span>
                  {step.estMin && <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{step.estMin}分</span>}
                  {step.tools && <span style={{ color: 'var(--cyan)', fontSize: 12 }}>🔧 {step.tools.join(', ')}</span>}
                </div>
              ))}
            </div>
          )}

          {/* 驗收標準 */}
          {item.acceptanceCriteria && (item.acceptanceCriteria as AcceptanceCriterion[]).length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>✅ 驗收標準</div>
              {(item.acceptanceCriteria as AcceptanceCriterion[]).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 10px', background: 'rgba(16,185,129,0.05)', borderRadius: 6, marginBottom: 4 }}>
                  <span style={{ color: 'var(--emerald)', fontWeight: 700, minWidth: 24 }}>{c.order}.</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{c.item}</span>
                  <code style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{c.condition}</code>
                  {c.range && <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{c.range.min}~{c.range.max}{c.range.unit}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
          尚無保養項目，請新增
        </div>
      )}

      {/* 保養項目編輯 Modal */}
      {showItemModal && (
        <Modal onClose={() => setShowItemModal(false)} title={editItem ? '編輯保養項目' : '新增保養項目'} large>
          <div className="form">
            <div className="form-field">
              <label>項目名稱 *</label>
              <input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="散熱風扇清潔與檢查" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-field">
                <label>週期類型</label>
                <select value={itemForm.frequencyType} onChange={e => setItemForm({ ...itemForm, frequencyType: e.target.value as any })}>
                  <option value="weekly">每週</option>
                  <option value="monthly">每月</option>
                  <option value="quarterly">每季</option>
                  <option value="half_yearly">每半年</option>
                  <option value="yearly">每年</option>
                </select>
              </div>
              <div className="form-field">
                <label>頻率值</label>
                <input type="number" min={1} value={itemForm.frequencyValue} onChange={e => setItemForm({ ...itemForm, frequencyValue: Number(e.target.value) })} />
              </div>
              <div className="form-field">
                <label>預估工時(分)</label>
                <input type="number" value={itemForm.estimatedMinutes} onChange={e => setItemForm({ ...itemForm, estimatedMinutes: Number(e.target.value) })} />
              </div>
            </div>
            <div className="form-field">
              <label>SOP 步驟（JSON 陣列）</label>
              <textarea value={itemForm.steps} onChange={e => setItemForm({ ...itemForm, steps: e.target.value })} rows={6}
                placeholder={JSON.stringify([
                  { order: 1, description: '關閉設備電源', est_min: 5, tools: ['驗電筆'] },
                  { order: 2, description: '拆開外蓋', est_min: 3, tools: ['螺絲起子組'] },
                ], null, 2)}
              />
            </div>
            <div className="form-field">
              <label>驗收標準（JSON 陣列）</label>
              <textarea value={itemForm.acceptanceCriteria} onChange={e => setItemForm({ ...itemForm, acceptanceCriteria: e.target.value })} rows={4}
                placeholder={JSON.stringify([
                  { order: 1, item: '風扇運轉無異音', condition: 'normal' },
                  { order: 2, item: '運轉電流', condition: 'range', range: { min: 0.5, max: 1.2, unit: 'A' } },
                ], null, 2)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowItemModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSaveItem} disabled={!itemForm.name}>{editItem ? '更新' : '建立'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default UnitDetailPage
