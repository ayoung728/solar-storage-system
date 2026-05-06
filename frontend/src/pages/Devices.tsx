import React, { useState } from 'react'

interface Device {
  id: number
  name: string
  status: 'online' | 'offline'
  power: number
}

interface DevicesPageProps {
  devices?: Device[]
}

function DevicesPage({ devices: propDevices }: DevicesPageProps) {
  const [devices] = useState<Device[]>(propDevices || [
    { id: 1, name: '太陽能板 A', status: 'online', power: 2500 },
    { id: 2, name: '太陽能板 B', status: 'offline', power: 0 },
    { id: 3, name: '電池儲能系統', status: 'online', power: 1500 },
  ])

  return (
    <div className="page">
      <h2>設備管理</h2>
      <table className="device-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>設備名稱</th>
            <th>狀態</th>
            <th>功率 (W)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(device => (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{device.name}</td>
              <td>
                <span className={`status-badge ${device.status}`}>
                  {device.status === 'online' ? '在線' : '離線'}
                </span>
              </td>
              <td>{device.power}</td>
              <td>
                <button className="btn btn-sm">編輯</button>
                <button className="btn btn-sm btn-danger">刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DevicesPage
