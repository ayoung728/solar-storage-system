import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Customer } from '../types'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

function CustomersPage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({ name: '', taxId: '', contactPerson: '', phone: '', email: '', address: '' })

  const loadCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getCustomers(search || undefined, token)
      setCustomers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCustomers() }, [token])
  useEffect(() => { const t = setTimeout(loadCustomers, 300); return () => clearTimeout(t) }, [search])

  const openCreate = () => {
    setEditCustomer(null)
    setFormData({ name: '', taxId: '', contactPerson: '', phone: '', email: '', address: '' })
    setShowModal(true)
  }

  const openEdit = (c: Customer) => {
    setEditCustomer(c)
    setFormData({ name: c.name, taxId: c.taxId || '', contactPerson: c.contactPerson || '', phone: c.phone || '', email: c.email || '', address: c.address || '' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (editCustomer) {
        await api.updateCustomer(editCustomer.id, formData, token)
        showToast('客戶已更新', 'success')
      } else {
        await api.createCustomer(formData, token)
        showToast('客戶已建立', 'success')
      }
      setShowModal(false)
      loadCustomers()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '操作失敗', 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定刪除此客戶？')) return
    try {
      await api.deleteCustomer(id, token)
      showToast('客戶已刪除', 'success')
      loadCustomers()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : '刪除失敗', 'error')
    }
  }

  if (loading && !customers.length) {
    return <div className="loading"><div className="loading-spinner" /><span>載入客戶資料...</span></div>
  }

  return (
    <>
      <div className="page-header">
        <h2>🏢 客戶管理</h2>
        <div className="page-actions">
          <input
            style={{ padding: '9px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 13, width: 220 }}
            placeholder="🔍 搜尋客戶名稱、代號..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={openCreate}>+ 新增客戶</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>代號</th>
              <th>公司名稱</th>
              <th>聯絡人</th>
              <th>電話</th>
              <th>Email</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><code style={{ color: 'var(--amber-400)' }}>{c.code}</code></td>
                <td><a href={`/customers/${c.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>{c.name}</a></td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.contactPerson || '-'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '-'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.email || '-'}</td>
                <td><span className={`status-badge ${c.status}`}>{c.status === 'active' ? '啟用' : '停用'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={`/customers/${c.id}`} className="btn btn-outline btn-sm">檢視</a>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>編輯</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>刪除</button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>暫無客戶資料</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={editCustomer ? '編輯客戶' : '新增客戶'}>
          <div className="form">
            <div className="form-field">
              <label>公司名稱 *</label>
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="請輸入公司名稱" />
            </div>
            <div className="form-field">
              <label>統一編號</label>
              <input value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} placeholder="請輸入統一編號" />
            </div>
            <div className="form-field">
              <label>聯絡人</label>
              <input value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="請輸入聯絡人姓名" />
            </div>
            <div className="form-field">
              <label>電話</label>
              <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="請輸入聯絡電話" />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="請輸入 Email" />
            </div>
            <div className="form-field">
              <label>地址</label>
              <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="請輸入地址" rows={2} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!formData.name}>{editCustomer ? '更新' : '建立'}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default CustomersPage
