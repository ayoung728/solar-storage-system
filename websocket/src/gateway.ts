import { Module } from '@nestjs/common'
import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: true,
  path: '/ws',
})
export class Gateway {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    console.log(`[WebSocket] 客戶端已連線: ${client.id}`)

    // 驗證令牌
    client.on('auth', async (data: { token: string }) => {
      try {
        // TODO: 驗證 JWT token
        console.log(`[WebSocket] 用戶 ${client.id} 已通過身份驗證`)
        client.data.authenticated = true
      } catch (error) {
        console.error(`[WebSocket] 身份驗證失敗:`, error)
        client.disconnect()
      }
    })

    // 設備連接事件
    client.on('connectDevice', (data: { deviceId: string }) => {
      console.log(`[WebSocket] 設備 ${data.deviceId} 已連接`)

      // 將設備加入對應的房間
      client.join(`device:${data.deviceId}`)

      this.server.emit('deviceConnected', {
        deviceId: data.deviceId,
        clientId: client.id,
        timestamp: new Date().toISOString(),
      })
    })

    // 設備發送 telemetryData
    client.on('sendTelemetry', (data: { deviceId: string; data: Record<string, unknown> }) => {
      console.log(`[WebSocket] 設備 ${data.deviceId} telemetryData:`, data.data)

      // 廣播給訂閱該設備的客戶端
      this.server.to(`device:${data.deviceId}`).emit('telemetryUpdate', {
        deviceId: data.deviceId,
        data: data.data,
        timestamp: new Date().toISOString(),
      })

      // 同時觸發警報檢查（如果後端有相關服務）
      this.server.emit('checkAlerts', { deviceId: data.deviceId, telemetryData: data.data })
    })

    // 手動發送警報
    client.on('sendAlert', (data: { deviceId?: string; message: string; severity: 'info' | 'warning' | 'error' }) => {
      console.log(`[WebSocket] 手動警報:`, data)

      this.server.emit('alert', {
        ...data,
        timestamp: new Date().toISOString(),
      })
    })

    // 請求設備狀態
    client.on('requestStatus', (data: { deviceId?: string }) => {
      console.log(`[WebSocket] 請求狀態:`, data)

      // TODO: 從資料庫查詢設備狀態並返回
      this.server.to(client.id).emit('statusResponse', {
        deviceId: data.deviceId,
        status: 'online', // TODO: 從資料庫獲取實際狀態
        timestamp: new Date().toISOString(),
      })
    })

    // 客戶端斷開連接
    client.on('disconnect', () => {
      console.log(`[WebSocket] 客戶端已斷開: ${client.id}`)
    })

    // 錯誤處理
    client.on('error', (error: Error) => {
      console.error(`[WebSocket] 客戶端錯誤 ${client.id}:`, error)
    })
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] 客戶端已斷開: ${client.id}`)
  }
}

@Module({
  exports: [Gateway],
})
export class GatewayModule {}
