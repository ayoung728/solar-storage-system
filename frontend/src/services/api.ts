const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request<T>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API error ${response.status}`)
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return {} as T
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }).then(data => {
      localStorage.setItem('token', data.accessToken)
      return data
    }),

  logout: () => localStorage.removeItem('token'),

  getToken: () => localStorage.getItem('token') || undefined,

  isAuthenticated: () => !!localStorage.getItem('token'),

  // Devices
  getDevices: (token?: string) =>
    request<Device[]>('/api/devices', {}, token),

  getDeviceStats: (token?: string) =>
    request<DeviceStats>('/api/devices/stats', {}, token),

  getDevice: (id: number, token?: string) =>
    request<Device>(`/api/devices/${id}`, {}, token),

  createDevice: (data: Partial<Device>, token?: string) =>
    request<Device>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateDevice: (id: number, data: Partial<Device>, token?: string) =>
    request<Device>(`/api/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteDevice: (id: number, token?: string) =>
    request<void>(`/api/devices/${id}`, { method: 'DELETE' }, token),

  updateDeviceStatus: (id: number, status: string, token?: string) =>
    request<Device>(`/api/devices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token),

  updateDeviceTelemetry: (id: number, telemetryData: Record<string, unknown>, token?: string) =>
    request<Device>(`/api/devices/${id}/telemetry`, {
      method: 'PUT',
      body: JSON.stringify({ telemetryData }),
    }, token),

  // Alerts
  getAlerts: (token?: string) =>
    request<Alert[]>('/api/alerts', {}, token),

  getAlertStats: (token?: string) =>
    request<AlertStats>('/api/alerts/stats', {}, token),

  getCriticalAlerts: (token?: string) =>
    request<Alert[]>('/api/alerts/critical', {}, token),

  getAlert: (id: number, token?: string) =>
    request<Alert>(`/api/alerts/${id}`, {}, token),

  createAlert: (data: Partial<Alert>, token?: string) =>
    request<Alert>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateAlertStatus: (id: number, status: string, token?: string) =>
    request<Alert>(`/api/alerts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token),

  clearResolvedAlerts: (token?: string) =>
    request<{ affected: number }>('/api/alerts/resolved', { method: 'DELETE' }, token),

  // Tickets
  getTickets: (status?: string, token?: string) => {
    const url = status ? `/api/tickets?status=${status}` : '/api/tickets'
    return request<Ticket[]>(url, {}, token)
  },

  getTicket: (id: number, token?: string) =>
    request<Ticket>(`/api/tickets/${id}`, {}, token),

  createTicket: (data: Partial<Ticket>, token?: string) =>
    request<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateTicket: (id: number, data: Partial<Ticket>, token?: string) =>
    request<Ticket>(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteTicket: (id: number, token?: string) =>
    request<void>(`/api/tickets/${id}`, { method: 'DELETE' }, token),

  getTicketStats: (token?: string) =>
    request<TicketStats>('/api/tickets/statistics', {}, token),

  getTicketsByPriority: (priority: string, token?: string) =>
    request<Ticket[]>(`/api/tickets/priority/${priority}`, {}, token),

  // Maintenance
  getMaintenance: (token?: string) =>
    request<MaintenanceRecord[]>('/api/maintenance', {}, token),

  getMaintenanceStats: (token?: string) =>
    request<MaintenanceStats>('/api/maintenance/stats', {}, token),

  getUpcomingMaintenance: (token?: string) =>
    request<MaintenanceRecord[]>('/api/maintenance/upcoming', {}, token),

  getMaintenanceById: (id: number, token?: string) =>
    request<MaintenanceRecord>(`/api/maintenance/${id}`, {}, token),

  createMaintenance: (data: Partial<MaintenanceRecord>, token?: string) =>
    request<MaintenanceRecord>('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateMaintenanceStatus: (id: number, status: string, token?: string) =>
    request<MaintenanceRecord>(`/api/maintenance/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token),

  completeMaintenance: (id: number, completionData: { actualCost?: number; notes?: string }, token?: string) =>
    request<MaintenanceRecord>(`/api/maintenance/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData),
    }, token),

  deleteMaintenance: (id: number, token?: string) =>
    request<void>(`/api/maintenance/${id}`, { method: 'DELETE' }, token),
}

export type DeviceStats = import('../types').DeviceStats
export type Alert = import('../types').Alert
export type AlertStats = import('../types').AlertStats
export type Ticket = import('../types').Ticket
export type TicketStats = import('../types').TicketStats
export type MaintenanceRecord = import('../types').MaintenanceRecord
export type MaintenanceStats = import('../types').MaintenanceStats
