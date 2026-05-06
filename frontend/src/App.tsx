import React, { useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import DashboardPage from './pages/Dashboard'
import DevicesPage from './pages/DevicesPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import AlertsPage from './pages/AlertsPage'
import MaintenancePage from './pages/MaintenancePage'
import TicketsPage from './pages/TicketsPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider, useToast } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { api } from './services/api'
import './App.css'

// WebSocket 服務：即時接收設備 telemetryData
function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef<((data: any) => void) | null>(null)

  const connect = (token: string, onMessage: (data: any) => void) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    const ws = new WebSocket(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/ws/telemetry`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket 已連線')
      ws.send(JSON.stringify({ type: 'auth', token }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch {
        console.error('WebSocket 訊息解析失敗:', event.data)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket 已斷線，5 秒後重連...')
      setTimeout(() => {
        if (token && onMessage) {
          connect(token, onMessage)
        }
      }, 5000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket 錯誤:', error)
    }

    onMessageRef.current = onMessage
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  return { connect, disconnect }
}

// 受保護的路由組件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Toast 通知組件（需要 useToast context）
function ToastContainer() {
  // This component just renders the toast container from ToastProvider
  return null
}

// 主要應用組件（需要 AuthProvider）
function AppContent() {
  const location = useLocation()
  const { isAuthenticated, token } = useAuth()
  const { connect, disconnect } = useWebSocket()

  // WebSocket 即時 telemetryData 處理
  useEffect(() => {
    if (isAuthenticated && token) {
      connect(token, (data) => {
        // 處理來自後端的即時設備數據
        console.log('即時 telemetryData:', data)

        // 可以在這裡更新特定設備的狀態或觸發警報
        if (data.type === 'telemetry_update') {
          // 更新對應設備的即時數據
          console.log(`設備 ${data.deviceId} 的 telemetryData 已更新:`, data.data)
        }

        if (data.type === 'alert') {
          // 新警報通知
          console.log('收到新警報:', data.message)
        }
      })

      return () => disconnect()
    }
  }, [isAuthenticated, token, connect, disconnect])

  // 側邊導航
  const Sidebar = () => {
    const navItems = [
      { path: '/', label: '📊 儀表板', icon: '📊' },
      { path: '/devices', label: '🔌 設備管理', icon: '🔌' },
      { path: '/alerts', label: '🔔 警報中心', icon: '🔔' },
      { path: '/maintenance', label: '🔧 維護管理', icon: '🔧' },
      { path: '/tickets', label: '📋 工單系統', icon: '📋' },
    ]

    return (
      <aside className="sidebar">
        <div className="logo">☀️ 太陽能儲能監控系統</div>
        <nav>
          <ul className="nav-menu">
            {navItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {isAuthenticated && (
          <div className="sidebar-footer">
            <button className="btn btn-danger" onClick={() => api.logout()}>
              登出
            </button>
          </div>
        )}
      </aside>
    )
  }

  // 頂部欄
  const TopBar = () => (
    <header className="topbar">
      <h1>太陽能儲能監控系統</h1>
      {isAuthenticated && (
        <div className="user-info">
          <span>👤 管理員</span>
          <button className="btn btn-sm" onClick={() => api.logout()}>
            登出
          </button>
        </div>
      )}
    </header>
  )

  return (
    <div className="app">
      {isAuthenticated && <Sidebar />}

      <main className="main-content">
        {isAuthenticated && <TopBar />}

        <Routes>
          {/* 公開路由 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 受保護的路由 */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/devices" element={
            <ProtectedRoute>
              <DevicesPage />
            </ProtectedRoute>
          } />
          <Route path="/devices/:deviceId" element={
            <ProtectedRoute>
              <DeviceDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          } />
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <MaintenancePage />
            </ProtectedRoute>
          } />
          <Route path="/tickets" element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          } />

          {/* 未登入時重定向到登入頁 */}
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </div>
  )
}

// 主應用組件（提供 AuthProvider 和 ToastProvider）
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
