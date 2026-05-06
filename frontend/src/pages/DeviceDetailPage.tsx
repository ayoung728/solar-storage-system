import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Device, DeviceFormData } from '../types'
import { Form } from '../components/Form'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'

interface DeviceDetailPageProps {
  deviceId: number
}

function DeviceDetailPage({ deviceId }: DeviceDetailPageProps) {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [device, setDevice] = useState<Device | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    deviceId: '',
    type: 'solar_panel',
    status: 'online',
    location: '',
    manufacturer: '',
    model: '',
    firmwareVersion: '',
    serialNumber: '',
    installedDate: '',
    lastMaintenanceDate: '',
  })

  useEffect(() => {
    async function loadDevice() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getDeviceById(deviceId, token)
        setDevice(data)
        setFormData({
          name: data.name,
          deviceId: data.deviceId,
          type: data.type,
          status: data.status,
          location: data.location || '',
          manufacturer: data.manufacturer || '',
          model: data.model || '',
          firmwareVersion: data.firmwareVersion || '',
          serialNumber: data.serialNumber || '',
          installedDate: data.installedDate || '',
          lastMaintenanceDate: data.lastMaintenanceDate || '',
        })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '載入設備資料失敗'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadDevice()
  }, [deviceId, token])

  const handleSave = async () => {
    try {
      await api.updateDevice(deviceId, formData, token)
      const updated = await api.getDeviceById(deviceId, token)
      setDevice(updated)
      setShowEditModal(false)
      showToast('success', '設備資料已更新')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新設備失敗'
      setError(message)
      showToast('error', message)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.updateDeviceStatus(deviceId, newStatus, token)
      const updated = await api.getDeviceById(deviceId, token)
      setDevice(updated)
      showToast('success', `設備狀態已更新為：${getStatusLabel(newStatus)}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新狀態失敗'
      showToast('error', message)
    }
  }

  const getStatusLabel = (status: string): string => {
    switch(status) {
      case 'online': return '線上'
      case 'offline': return '離線'
      case 'maintenance': return '維護中'
      case 'warning': return '警告'
      default: return status
    }
  }

  const getTypeLabel = (type: string): string => {
    switch(type) {
      case 'solar_panel': return '太陽能板'
      case 'battery_storage': return '電池儲能'
      case 'inverter': return '逆變器'
      case 'monitoring': return '監控系統'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="page">
        <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
          ← 返回設備列表
        </button>
        <h2>設備詳情</h2>
        <div className="loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
          ← 返回設備列表
        </button>
        <h2>設備詳情</h2>
        <div className="error">❌ {error}</div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="page">
        <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
          ← 返回設備列表
        </button>
        <h2>設備詳情</h2>
        <div className="error">❌ 找不到設備</div>
      </div>
    )
  }

  const formFields = [
    { name: 'name', label: '設備名稱', type: 'text' as const, required: true },
    { name: 'deviceId', label: '設備編號', type: 'text' as const, required: true },
    { name: 'type', label: '設備類型', type: 'select' as const, options: [
      { value: 'solar_panel', label: '太陽能板' },
      { value: 'battery_storage', label: '電池儲能' },
      { value: 'inverter', label: '逆變器' },
      { value: 'monitoring', label: '監控系統' },
    ], required: true },
    { name: 'status', label: '設備狀態', type: 'select' as const, options: [
      { value: 'online', label: '線上' },
      { value: 'offline', label: '離線' },
      { value: 'maintenance', label: '維護中' },
      { value: 'warning', label: '警告' },
    ], required: true },
    { name: 'location', label: '安裝位置', type: 'text' as const },
    { name: 'manufacturer', label: '廠牌', type: 'text' as const },
    { name: 'model', label: '型號', type: 'text' as const },
    { name: 'firmwareVersion', label: '韌體版本', type: 'text' as const },
    { name: 'serialNumber', label: '序號', type: 'text' as const },
    { name: 'installedDate', label: '安裝日期', type: 'date' as const },
    { name: 'lastMaintenanceDate', label: '最後維護日期', type: 'date' as const },
  ]

  return (
    <div className="page">
      <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
        ← 返回設備列表
      </button>

      <h2>設備詳情</h2>

      {/* 設備資訊卡片 */}
      <div className="device-detail-card">
        <div className="detail-header">
          <h3>{device.name}</h3>
          <span className={`status-badge ${device.status}`}>
            {getStatusLabel(device.status)}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">設備編號：</span>
            <span className="value">{device.deviceId}</span>
          </div>
          <div className="detail-item">
            <span className="label">設備類型：</span>
            <span className="value">{getTypeLabel(device.type)}</span>
          </div>
          {device.location && (
            <div className="detail-item">
              <span className="label">安裝位置：</span>
              <span className="value">{device.location}</span>
            </div>
          )}
          {device.manufacturer && (
            <div className="detail-item">
              <span className="label">廠牌：</span>
              <span className="value">{device.manufacturer}</span>
            </div>
          )}
          {device.model && (
            <div className="detail-item">
              <span className="label">型號：</span>
              <span className="value">{device.model}</span>
            </div>
          )}
          {device.firmwareVersion && (
            <div className="detail-item">
              <span className="label">韌體版本：</span>
              <span className="value">{device.firmwareVersion}</span>
            </div>
          )}
          {device.serialNumber && (
            <div className="detail-item">
              <span className="label">序號：</span>
              <span className="value">{device.serialNumber}</span>
            </div>
          )}
          {device.installedDate && (
            <div className="detail-item">
              <span className="label">安裝日期：</span>
              <span className="value">{device.installedDate}</span>
            </div>
          )}
          {device.lastMaintenanceDate && (
            <div className="detail-item">
              <span className="label">最後維護：</span>
              <span className="value">{device.lastMaintenanceDate}</span>
            </div>
          )}
        </div>

        {/* 即時數據 */}
        {device.telemetryData && Object.keys(device.telemetryData).length > 0 && (
          <div className="telemetry-section">
            <h4>即時數據</h4>
            <div className="telemetry-grid">
              {Object.entries(device.telemetryData).map(([key, value]) => (
                <div key={key} className="telemetry-item">
                  <span className="label">{key}</span>
                  <span className="value">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="detail-actions">
          <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
            編輯設備
          </button>
          {device.status === 'online' && (
            <button className="btn btn-warning" onClick={() => handleStatusChange('maintenance')}>
              設為維護中
            </button>
          )}
          {device.status === 'offline' && (
            <button className="btn btn-success" onClick={() => handleStatusChange('online')}>
              設為線上
            </button>
          )}
          {device.status === 'maintenance' && (
            <button className="btn btn-success" onClick={() => handleStatusChange('online')}>
              恢復線上
            </button>
          )}
          <button className="btn btn-danger" onClick={async () => {
            if (window.confirm('確定要刪除此設備嗎？')) {
              try {
                await api.deleteDevice(deviceId, token)
                showToast('success', '設備已刪除')
                window.location.hash = '#/devices'
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : '刪除設備失敗'
                showToast('error', message)
              }
            }
          }}>
            刪除設備
          </button>
        </div>
      </div>

      {/* 編輯彈出視窗 */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="編輯設備">
        <Form
          fields={formFields}
          initialData={formData}
          onSubmit={handleSave}
          submitLabel="儲存變更"
        />
      </Modal>
    </div>
  )
}

export default DeviceDetailPage
