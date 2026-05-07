import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Customer, Site } from '../types'

function CustomerDetailPage() {
  const { token } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get customer id from URL
  const customerId = Number(window.location.pathname.split('/')[2])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await api.getCustomer(customerId, token)
        setCustomer(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '載入失敗')
      } finally {
        setLoading(false)
      }
    }
    if (customerId) load()
  }, [customerId, token])

  if (loading) return <div className="loading"><div className="loading-spinner" /><span>載入客戶資料...</span></div>
  if (error) return <><div className="page-header"><h2>🏢 客戶詳情</h2></div><div className="error">{error}</div></>
  if (!customer) return <><div className="page-header"><h2>🏢 客戶詳情</h2></div><div className="error">找不到客戶</div></>

  return (
    <>
      <div className="page-header">
        <h2>🏢 {customer.name}</h2>
        <div className="page-actions">
          <a href="/customers" className="btn btn-outline">← 返回列表</a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div className="chart-container">
          <h3>📋 基本資料</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="summary-item"><span className="label">客戶代號</span><span className="value">{customer.code}</span></div>
            <div className="summary-item"><span className="label">統一編號</span><span className="value">{customer.taxId || '-'}</span></div>
            <div className="summary-item"><span className="label">狀態</span><span className={`status-badge ${customer.status}`} style={{ fontSize: 12 }}>{customer.status === 'active' ? '啟用' : '停用'}</span></div>
          </div>
        </div>
        <div className="chart-container">
          <h3>📞 聯絡資訊</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="summary-item"><span className="label">聯絡人</span><span className="value">{customer.contactPerson || '-'}</span></div>
            <div className="summary-item"><span className="label">電話</span><span className="value">{customer.phone || '-'}</span></div>
            <div className="summary-item"><span className="label">Email</span><span className="value">{customer.email || '-'}</span></div>
            <div className="summary-item"><span className="label">地址</span><span className="value">{customer.address || '-'}</span></div>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>☀️ 名下案場（{(customer.sites || []).length}）</h3>
      <div className="data-table-wrapper" style={{ marginBottom: 28 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>案場代號</th>
              <th>名稱</th>
              <th>種類</th>
              <th>容量(kWp)</th>
              <th>地址</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {(customer.sites || []).map(s => (
              <tr key={s.id}>
                <td><code style={{ color: 'var(--amber-400)' }}>{s.code}</code></td>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.siteType}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.capacityKwp ? `${s.capacityKwp} kWp` : '-'}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.address || '-'}</td>
                <td><span className={`status-badge ${s.status}`}>{s.status === 'active' ? '運轉中' : s.status === 'constructing' ? '建置中' : '停機'}</span></td>
                <td><a href={`/sites/${s.id}`} className="btn btn-outline btn-sm">檢視</a></td>
              </tr>
            ))}
            {(!customer.sites || customer.sites.length === 0) && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>尚無案場資料</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default CustomerDetailPage
