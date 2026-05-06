     1|import React, { useState, useEffect } from 'react'
     2|import { useAuth } from '../contexts/AuthContext'
     3|import { api } from '../services/api'
     4|import type { Device, DeviceFormData } from '../types'
     5|import { Form } from '../components/Form'
     6|import { Modal } from '../components/Modal'
     7|import { useToast } from '../components/Toast'
     8|
     9|interface DeviceDetailPageProps {
    10|  deviceId: number
    11|}
    12|
    13|function DeviceDetailPage({ deviceId }: DeviceDetailPageProps) {
    14|  const { token } = useAuth()
    15|  const { showToast } = useToast()
    16|  const [device, setDevice] = useState<Device | null>(null)
    17|  const [loading, setLoading] = useState(true)
    18|  const [error, setError] = useState<string | null>(null)
    19|  const [showEditModal, setShowEditModal] = useState(false)
    20|  const [formData, setFormData] = useState<DeviceFormData>({
    21|    name: '',
    22|    deviceId: '',
    23|    type: 'solar_panel',
    24|    status: 'online',
    25|    location: '',
    26|    manufacturer: '',
    27|    model: '',
    28|    firmwareVersion: '',
    29|    name: '',
    30|    installedDate: '',
    31|    lastMaintenanceDate: '',
    32|  })
    33|
    34|  useEffect(() => {
    35|    async function loadDevice() {
    36|      try {
    37|        setLoading(true)
    38|        setError(null)
    39|        const data = await api.getDeviceById(deviceId, token)
    40|        setDevice(data)
    41|        setFormData({
    42|          name: data.name,
    43|          deviceId: data.deviceId,
    44|          type: data.type,
    45|          status: data.status,
    46|          location: data.location || '',
    47|          manufacturer: data.manufacturer || '',
    48|          model: data.model || '',
    49|          firmwareVersion: data.firmwareVersion || '',
    50|          name: data.name || '',
    51|          installedDate: data.installedDate || '',
    52|          lastMaintenanceDate: data.lastMaintenanceDate || '',
    53|        })
    54|      } catch (err: unknown) {
    55|        const message = err instanceof Error ? err.message : '載入設備資料失敗'
    56|        setError(message)
    57|      } finally {
    58|        setLoading(false)
    59|      }
    60|    }
    61|
    62|    loadDevice()
    63|  }, [deviceId, token])
    64|
    65|  const handleSave = async () => {
    66|    try {
    67|      await api.updateDevice(deviceId, formData, token)
    68|      const updated = await api.getDeviceById(deviceId, token)
    69|      setDevice(updated)
    70|      setShowEditModal(false)
    71|      showToast('success', '設備資料已更新')
    72|    } catch (err: unknown) {
    73|      const message = err instanceof Error ? err.message : '更新設備失敗'
    74|      setError(message)
    75|      showToast('error', message)
    76|    }
    77|  }
    78|
    79|  const handleStatusChange = async (newStatus: string) => {
    80|    try {
    81|      await api.updateDeviceStatus(deviceId, newStatus, token)
    82|      const updated = await api.getDeviceById(deviceId, token)
    83|      setDevice(updated)
    84|      showToast('success', `設備狀態已更新為：${getStatusLabel(newStatus)}`)
    85|    } catch (err: unknown) {
    86|      const message = err instanceof Error ? err.message : '更新狀態失敗'
    87|      showToast('error', message)
    88|    }
    89|  }
    90|
    91|  const getStatusLabel = (status: string): string => {
    92|    switch(status) {
    93|      case 'online': return '線上'
    94|      case 'offline': return '離線'
    95|      case 'maintenance': return '維護中'
    96|      case 'warning': return '警告'
    97|      default: return status
    98|    }
    99|  }
   100|
   101|  const getTypeLabel = (type: string): string => {
   102|    switch(type) {
   103|      case 'solar_panel': return '太陽能板'
   104|      case 'battery_storage': return '電池儲能'
   105|      case 'inverter': return '逆變器'
   106|      case 'monitoring': return '監控系統'
   107|      default: return type
   108|    }
   109|  }
   110|
   111|  if (loading) {
   112|    return (
   113|      <div className="page">
   114|        <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
   115|          ← 返回設備列表
   116|        </button>
   117|        <h2>設備詳情</h2>
   118|        <div className="loading">載入中...</div>
   119|      </div>
   120|    )
   121|  }
   122|
   123|  if (error) {
   124|    return (
   125|      <div className="page">
   126|        <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
   127|          ← 返回設備列表
   128|        </button>
   129|        <h2>設備詳情</h2>
   130|        <div className="error">❌ {error}</div>
   131|      </div>
   132|    )
   133|  }
   134|
   135|  if (!device) {
   136|    return (
   137|      <div className="page">
   138|        <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
   139|          ← 返回設備列表
   140|        </button>
   141|        <h2>設備詳情</h2>
   142|        <div className="error">❌ 找不到設備</div>
   143|      </div>
   144|    )
   145|  }
   146|
   147|  const formFields = [
   148|    { name: 'name', label: '設備名稱', type: 'text' as const, required: true },
   149|    { name: 'deviceId', label: '設備編號', type: 'text' as const, required: true },
   150|    { name: 'type', label: '設備類型', type: 'select' as const, options: [
   151|      { value: 'solar_panel', label: '太陽能板' },
   152|      { value: 'battery_storage', label: '電池儲能' },
   153|      { value: 'inverter', label: '逆變器' },
   154|      { value: 'monitoring', label: '監控系統' },
   155|    ], required: true },
   156|    { name: 'status', label: '設備狀態', type: 'select' as const, options: [
   157|      { value: 'online', label: '線上' },
   158|      { value: 'offline', label: '離線' },
   159|      { value: 'maintenance', label: '維護中' },
   160|      { value: 'warning', label: '警告' },
   161|    ], required: true },
   162|    { name: 'location', label: '安裝位置', type: 'text' as const },
   163|    { name: 'manufacturer', label: '廠牌', type: 'text' as const },
   164|    { name: 'model', label: '型號', type: 'text' as const },
   165|    { name: 'firmwareVersion', label: '韌體版本', type: 'text' as const },
   166|    { name: 'name', label: '序號', type: 'text' as const },
   167|    { name: 'installedDate', label: '安裝日期', type: 'date' as const },
   168|    { name: 'lastMaintenanceDate', label: '最後維護日期', type: 'date' as const },
   169|  ]
   170|
   171|  return (
   172|    <div className="page">
   173|      <button className="btn btn-outline" onClick={() => window.location.hash = '#/devices'}>
   174|        ← 返回設備列表
   175|      </button>
   176|
   177|      <h2>設備詳情</h2>
   178|
   179|      {/* 設備資訊卡片 */}
   180|      <div className="device-detail-card">
   181|        <div className="detail-header">
   182|          <h3>{device.name}</h3>
   183|          <span className={`status-badge ${device.status}`}>
   184|            {getStatusLabel(device.status)}
   185|          </span>
   186|        </div>
   187|
   188|        <div className="detail-grid">
   189|          <div className="detail-item">
   190|            <span className="label">設備編號：</span>
   191|            <span className="value">{device.deviceId}</span>
   192|          </div>
   193|          <div className="detail-item">
   194|            <span className="label">設備類型：</span>
   195|            <span className="value">{getTypeLabel(device.type)}</span>
   196|          </div>
   197|          {device.location && (
   198|            <div className="detail-item">
   199|              <span className="label">安裝位置：</span>
   200|              <span className="value">{device.location}</span>
   201|            </div>
   202|          )}
   203|          {device.manufacturer && (
   204|            <div className="detail-item">
   205|              <span className="label">廠牌：</span>
   206|              <span className="value">{device.manufacturer}</span>
   207|            </div>
   208|          )}
   209|          {device.model && (
   210|            <div className="detail-item">
   211|              <span className="label">型號：</span>
   212|              <span className="value">{device.model}</span>
   213|            </div>
   214|          )}
   215|          {device.firmwareVersion && (
   216|            <div className="detail-item">
   217|              <span className="label">韌體版本：</span>
   218|              <span className="value">{device.firmwareVersion}</span>
   219|            </div>
   220|          )}
   221|          {device.name && (
   222|            <div className="detail-item">
   223|              <span className="label">序號：</span>
   224|              <span className="value">{device.name}</span>
   225|            </div>
   226|          )}
   227|          {device.installedDate && (
   228|            <div className="detail-item">
   229|              <span className="label">安裝日期：</span>
   230|              <span className="value">{device.installedDate}</span>
   231|            </div>
   232|          )}
   233|          {device.lastMaintenanceDate && (
   234|            <div className="detail-item">
   235|              <span className="label">最後維護：</span>
   236|              <span className="value">{device.lastMaintenanceDate}</span>
   237|            </div>
   238|          )}
   239|        </div>
   240|
   241|        {/* 即時數據 */}
   242|        {device.telemetryData && Object.keys(device.telemetryData).length > 0 && (
   243|          <div className="telemetry-section">
   244|            <h4>即時數據</h4>
   245|            <div className="telemetry-grid">
   246|              {Object.entries(device.telemetryData).map(([key, value]) => (
   247|                <div key={key} className="telemetry-item">
   248|                  <span className="label">{key}</span>
   249|                  <span className="value">{String(value)}</span>
   250|                </div>
   251|              ))}
   252|            </div>
   253|          </div>
   254|        )}
   255|
   256|        {/* 操作按鈕 */}
   257|        <div className="detail-actions">
   258|          <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
   259|            編輯設備
   260|          </button>
   261|          {device.status === 'online' && (
   262|            <button className="btn btn-warning" onClick={() => handleStatusChange('maintenance')}>
   263|              設為維護中
   264|            </button>
   265|          )}
   266|          {device.status === 'offline' && (
   267|            <button className="btn btn-success" onClick={() => handleStatusChange('online')}>
   268|              設為線上
   269|            </button>
   270|          )}
   271|          {device.status === 'maintenance' && (
   272|            <button className="btn btn-success" onClick={() => handleStatusChange('online')}>
   273|              恢復線上
   274|            </button>
   275|          )}
   276|          <button className="btn btn-danger" onClick={async () => {
   277|            if (window.confirm('確定要刪除此設備嗎？')) {
   278|              try {
   279|                await api.deleteDevice(deviceId, token)
   280|                showToast('success', '設備已刪除')
   281|                window.location.hash = '#/devices'
   282|              } catch (err: unknown) {
   283|                const message = err instanceof Error ? err.message : '刪除設備失敗'
   284|                showToast('error', message)
   285|              }
   286|            }
   287|          }}>
   288|            刪除設備
   289|          </button>
   290|        </div>
   291|      </div>
   292|
   293|      {/* 編輯彈出視窗 */}
   294|      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="編輯設備">
   295|        <Form
   296|          fields={formFields}
   297|          initialData={formData}
   298|          onSubmit={handleSave}
   299|          submitLabel="儲存變更"
   300|        />
   301|      </Modal>
   302|    </div>
   303|  )
   304|}
   305|
   306|export default DeviceDetailPage
   307|