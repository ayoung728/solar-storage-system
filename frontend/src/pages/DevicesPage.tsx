     1|import React, { useState, useEffect } from 'react'
     2|import { useAuth } from '../contexts/AuthContext'
     3|import { api } from '../services/api'
     4|import type { Device, DeviceStats } from '../types'
     5|
     6|function DevicesPage() {
     7|  const { token } = useAuth()
     8|  const [devices, setDevices] = useState<Device[]>([])
     9|  const [stats, setStats] = useState<DeviceStats | null>(null)
    10|  const [filter, setFilter] = useState<string>('all')
    11|  const [loading, setLoading] = useState(true)
    12|  const [error, setError] = useState<string | null>(null)
    13|
    14|  useEffect(() => {
    15|    async function loadDevices() {
    16|      try {
    17|        setLoading(true)
    18|        setError(null)
    19|        const [devicesData, statsData] = await Promise.all([
    20|          api.getDevices(token),
    21|          api.getDeviceStats(token),
    22|        ])
    23|        setDevices(devicesData)
    24|        setStats(statsData)
    25|      } catch (err: unknown) {
    26|        const message = err instanceof Error ? err.message : '載入設備資料失敗'
    27|        setError(message)
    28|      } finally {
    29|        setLoading(false)
    30|      }
    31|    }
    32|
    33|    loadDevices()
    34|  }, [token])
    35|
    36|  const filteredDevices = filter === 'all'
    37|    ? devices
    38|    : devices.filter(d => d.status === filter)
    39|
    40|  const getStatusBadge = (status: string) => {
    41|    switch(status) {
    42|      case 'online': return <span className="badge status-online">🟢 線上</span>
    43|      case 'offline': return <span className="badge status-offline">🔴 離線</span>
    44|      case 'maintenance': return <span className="badge status-maintenance">🔧 維護中</span>
    45|      case 'warning': return <span className="badge status-warning">⚠️ 警告</span>
    46|      default: return null
    47|    }
    48|  }
    49|
    50|  const getTypeLabel = (type: string) => {
    51|    switch(type) {
    52|      case 'solar_panel': return '太陽能板'
    53|      case 'battery_storage': return '電池儲能'
    54|      case 'inverter': return '逆變器'
    55|      case 'monitoring': return '監控系統'
    56|      default: return type
    57|    }
    58|  }
    59|
    60|  const handleStatusChange = async (id: number, newStatus: string) => {
    61|    try {
    62|      await api.updateDeviceStatus(id, newStatus, token)
    63|      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: newStatus as Device['status'] } : d))
    64|    } catch (err: unknown) {
    65|      const message = err instanceof Error ? err.message : '更新狀態失敗'
    66|      setError(message)
    67|    }
    68|  }
    69|
    70|  if (loading) {
    71|    return (
    72|      <div className="page">
    73|        <h2>設備管理</h2>
    74|        <div className="loading">載入中...</div>
    75|      </div>
    76|    )
    77|  }
    78|
    79|  if (error) {
    80|    return (
    81|      <div className="page">
    82|        <h2>設備管理</h2>
    83|        <div className="error">❌ {error}</div>
    84|      </div>
    85|    )
    86|  }
    87|
    88|  return (
    89|    <div className="page">
    90|      <h2>設備管理</h2>
    91|
    92|      {/* 統計摘要 */}
    93|      {stats && (
    94|        <div className="stats-summary">
    95|          <div className="stat-item">
    96|            <span className="label">總數</span>
    97|            <span className="value">{stats.total}</span>
    98|          </div>
    99|          <div className="stat-item">
   100|            <span className="label">線上</span>
   101|            <span className="value">{stats.online}</span>
   102|          </div>
   103|          <div className="stat-item">
   104|            <span className="label">離線</span>
   105|            <span className="value">{stats.offline}</span>
   106|          </div>
   107|          <div className="stat-item">
   108|            <span className="label">維護中</span>
   109|            <span className="value">{stats.maintenance}</span>
   110|          </div>
   111|          <div className="stat-item">
   112|            <span className="label">警告</span>
   113|            <span className="value">{stats.warning}</span>
   114|          </div>
   115|        </div>
   116|      )}
   117|
   118|      {/* 篩選器 */}
   119|      <div className="filter-bar">
   120|        <button
   121|          className={`btn ${filter === 'all' ? 'btn-primary' : ''}`}
   122|          onClick={() => setFilter('all')}
   123|        >
   124|          全部 ({devices.length})
   125|        </button>
   126|        <button
   127|          className={`btn ${filter === 'online' ? 'btn-primary' : ''}`}
   128|          onClick={() => setFilter('online')}
   129|        >
   130|          線上 ({devices.filter(d => d.status === 'online').length})
   131|        </button>
   132|        <button
   133|          className={`btn ${filter === 'offline' ? 'btn-primary' : ''}`}
   134|          onClick={() => setFilter('offline')}
   135|        >
   136|          離線 ({devices.filter(d => d.status === 'offline').length})
   137|        </button>
   138|        <button
   139|          className={`btn ${filter === 'maintenance' ? 'btn-primary' : ''}`}
   140|          onClick={() => setFilter('maintenance')}
   141|        >
   142|          維護中 ({devices.filter(d => d.status === 'maintenance').length})
   143|        </button>
   144|      </div>
   145|
   146|      {/* 設備列表 */}
   147|      <div className="devices-list">
   148|        {filteredDevices.map(device => (
   149|          <div key={device.id} className="device-card">
   150|            <div className="card-header">
   151|              <h3>{device.name}</h3>
   152|              {getStatusBadge(device.status)}
   153|            </div>
   154|            <div className="card-body">
   155|              <p><strong>設備編號：</strong>{device.deviceId}</p>
   156|              <p><strong>類型：</strong>{getTypeLabel(device.type)}</p>
   157|              {device.location && <p><strong>位置：</strong>{device.location}</p>}
   158|              {device.manufacturer && <p><strong>廠牌：</strong>{device.manufacturer}</p>}
   159|              {device.model && <p><strong>型號：</strong>{device.model}</p>}
   160|              {device.firmwareVersion && <p><strong>韌體版本：</strong>{device.firmwareVersion}</p>}
   161|              {device.name && <p><strong>序號：</strong>{device.name}</p>}
   162|              {device.installedDate && <p><strong>安裝日期：</strong>{device.installedDate}</p>}
   163|              {device.lastMaintenanceDate && <p><strong>最後維護：</strong>{device.lastMaintenanceDate}</p>}
   164|
   165|              {/* 即時數據 */}
   166|              {device.telemetryData && Object.keys(device.telemetryData).length > 0 && (
   167|                <div className="telemetry-section">
   168|                  <p><strong>即時數據：</strong></p>
   169|                  {Object.entries(device.telemetryData).map(([key, value]) => (
   170|                    <span key={key} className="telemetry-item">
   171|                      {key}: {String(value)}
   172|                    </span>
   173|                  ))}
   174|                </div>
   175|              )}
   176|            </div>
   177|            <div className="card-actions">
   178|              {device.status === 'online' && (
   179|                <>
   180|                  <button className="btn btn-warning" onClick={() => handleStatusChange(device.id, 'maintenance')}>
   181|                    設為維護中
   182|                  </button>
   183|                </>
   184|              )}
   185|              {device.status === 'offline' && (
   186|                <>
   187|                  <button className="btn btn-success" onClick={() => handleStatusChange(device.id, 'online')}>
   188|                    設為線上
   189|                  </button>
   190|                </>
   191|              )}
   192|              {device.status === 'maintenance' && (
   193|                <>
   194|                  <button className="btn btn-success" onClick={() => handleStatusChange(device.id, 'online')}>
   195|                    恢復線上
   196|                  </button>
   197|                </>
   198|              )}
   199|            </div>
   200|          </div>
   201|        ))}
   202|      </div>
   203|
   204|      {/* 新增設備按鈕 */}
   205|      <div className="page-actions">
   206|        <button className="btn btn-primary" onClick={() => alert('新增設備功能開發中')}>
   207|          + 新增設備
   208|        </button>
   209|      </div>
   210|    </div>
   211|  )
   212|}
   213|
   214|export default DevicesPage
   215|