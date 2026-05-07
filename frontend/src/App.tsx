import React, { useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import DashboardPage from './pages/Dashboard'
import DevicesPage from './pages/DevicesPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import AlertsPage from './pages/AlertsPage'
import MaintenancePage from './pages/MaintenancePage'
import TicketsPage from './pages/TicketsPage'
import LoginPage from './pages/LoginPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import SitesPage from './pages/SitesPage'
import SiteDetailPage from './pages/SiteDetailPage'
import UnitDetailPage from './pages/UnitDetailPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider, useToast } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { api } from './services/api'
import './App.css'

// WebSocket 服務
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function ToastContainer() {
  return null
}

function AppContent() {
  const location = useLocation()
  const { isAuthenticated, token } = useAuth()
  const { connect, disconnect } = useWebSocket()

  useEffect(() => {
    if (isAuthenticated && token) {
      connect(token, (data) => {
        console.log('即時 telemetryData:', data)
        if (data.type === 'telemetry_update') {
          console.log(`設備 ${data.deviceId} 的 telemetryData 已更新:`, data.data)
        }
        if (data.type === 'alert') {
          console.log('收到新警報:', data.message)
        }
      })
      return () => disconnect()
    }
  }, [isAuthenticated, token, connect, disconnect])

  const Sidebar = () => {
    const navItems = [
      { path: '/', label: '儀表板', icon: '📊' },
      { path: '/customers', label: '客戶管理', icon: '🏢' },
      { path: '/sites', label: '案場總覽', icon: '☀️' },
      { path: '/devices', label: '設備列表', icon: '🔌' },
      { path: '/alerts', label: '警報中心', icon: '🔔' },
      { path: '/tickets', label: '工單系統', icon: '📋' },
    ]

    const isActive = (path: string) => {
      if (path === '/') return location.pathname === '/'
      return location.pathname.startsWith(path)
    }

    return (
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">☀️</div>
          <span className="logo-text">太陽能儲能<br/>監控系統</span>
        </div>
        <nav>
          <ul className="nav-menu">
            {navItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {isAuthenticated && (
          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '0 4px' }}>
              <div className="user-avatar">A</div>
              <span className="user-name">管理員</span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => api.logout()} style={{ width: '100%' }}>
              登出
            </button>
          </div>
        )}
      </aside>
    )
  }

  const TopBar = () => (
    <header className="topbar">
      <h1>
        {location.pathname === '/' && '📊 儀表板'}
        {location.pathname.startsWith('/customers') && '🏢 客戶管理'}
        {location.pathname.startsWith('/sites') && '☀️ 案場管理'}
        {location.pathname.startsWith('/devices') && '🔌 設備管理'}
        {location.pathname.startsWith('/alerts') && '🔔 警報中心'}
        {location.pathname.startsWith('/tickets') && '📋 工單系統'}
        {location.pathname.startsWith('/maintenance') && '🔧 維護管理'}
      </h1>
      {isAuthenticated && (
        <div className="user-info">
          <div className="user-avatar">A</div>
          <span className="user-name">管理員</span>
          <button className="btn btn-outline btn-sm" onClick={() => api.logout()}>
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
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />
          <Route path="/sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
          <Route path="/sites/:id" element={<ProtectedRoute><SiteDetailPage /></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
          <Route path="/devices/:deviceId" element={<ProtectedRoute><DeviceDetailPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
          <Route path="/units/:id" element={<ProtectedRoute><UnitDetailPage /></ProtectedRoute>} />

          <Route path="*" element={
            isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </div>
  )
}

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
