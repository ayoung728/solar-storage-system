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
  // ── Auth ──
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

  // ── Customers ──
  getCustomers: (search?: string, token?: string) => {
    const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : '/api/customers'
    return request<Customer[]>(url, {}, token)
  },

  getCustomer: (id: number, token?: string) =>
    request<Customer>(`/api/customers/${id}`, {}, token),

  getCustomerSites: (id: number, token?: string) =>
    request<Site[]>(`/api/customers/${id}/sites`, {}, token),

  createCustomer: (data: Partial<Customer>, token?: string) =>
    request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateCustomer: (id: number, data: Partial<Customer>, token?: string) =>
    request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteCustomer: (id: number, token?: string) =>
    request<void>(`/api/customers/${id}`, { method: 'DELETE' }, token),

  // ── Sites ──
  getSites: (customerId?: number, search?: string, token?: string) => {
    let url = '/api/sites'
    const params: string[] = []
    if (customerId) params.push(`customerId=${customerId}`)
    if (search) params.push(`search=${encodeURIComponent(search)}`)
    if (params.length) url += '?' + params.join('&')
    return request<Site[]>(url, {}, token)
  },

  getSite: (id: number, token?: string) =>
    request<Site>(`/api/sites/${id}`, {}, token),

  createSite: (data: Partial<Site>, token?: string) =>
    request<Site>('/api/sites', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateSite: (id: number, data: Partial<Site>, token?: string) =>
    request<Site>(`/api/sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  updateSiteStatus: (id: number, status: string, token?: string) =>
    request<Site>(`/api/sites/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token),

  deleteSite: (id: number, token?: string) =>
    request<void>(`/api/sites/${id}`, { method: 'DELETE' }, token),

  // ── Units ──
  getDeviceUnits: (deviceId: number, token?: string) =>
    request<Unit[]>(`/api/devices/${deviceId}/units`, {}, token),

  getUnit: (id: number, token?: string) =>
    request<Unit>(`/api/units/${id}`, {}, token),

  createUnit: (deviceId: number, data: Partial<Unit>, token?: string) =>
    request<Unit>(`/api/devices/${deviceId}/units`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateUnit: (id: number, data: Partial<Unit>, token?: string) =>
    request<Unit>(`/api/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteUnit: (id: number, token?: string) =>
    request<void>(`/api/units/${id}`, { method: 'DELETE' }, token),

  // ── Maintenance Items ──
  getUnitMaintenanceItems: (unitId: number, token?: string) =>
    request<MaintenanceItem[]>(`/api/units/${unitId}/items`, {}, token),

  getMaintenanceItem: (id: number, token?: string) =>
    request<MaintenanceItem>(`/api/maintenance-items/${id}`, {}, token),

  createMaintenanceItem: (unitId: number, data: Partial<MaintenanceItem>, token?: string) =>
    request<MaintenanceItem>(`/api/units/${unitId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateMaintenanceItem: (id: number, data: Partial<MaintenanceItem>, token?: string) =>
    request<MaintenanceItem>(`/api/maintenance-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteMaintenanceItem: (id: number, token?: string) =>
    request<void>(`/api/maintenance-items/${id}`, { method: 'DELETE' }, token),

  // ── Work Items ──
  getWorkItems: (params?: { siteId?: number; status?: string; source?: string }, token?: string) => {
    const query = new URLSearchParams()
    if (params?.siteId) query.set('siteId', String(params.siteId))
    if (params?.status) query.set('status', params.status)
    if (params?.source) query.set('source', params.source)
    const qs = query.toString()
    return request<WorkItem[]>(`/api/work-items${qs ? '?' + qs : ''}`, {}, token)
  },

  getWorkPool: (token?: string) =>
    request<WorkItem[]>('/api/work-items/pool', {}, token),

  getWorkItem: (id: number, token?: string) =>
    request<WorkItem>(`/api/work-items/${id}`, {}, token),

  createWorkItem: (data: Partial<WorkItem>, token?: string) =>
    request<WorkItem>('/api/work-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateWorkItemStatus: (id: number, status: string, token?: string) =>
    request<WorkItem>(`/api/work-items/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token),

  deleteWorkItem: (id: number, token?: string) =>
    request<void>(`/api/work-items/${id}`, { method: 'DELETE' }, token),

  // ── Dispatch Packages ──
  getDispatchPackages: (status?: string, engineerId?: number, token?: string) => {
    const query = new URLSearchParams()
    if (status) query.set('status', status)
    if (engineerId) query.set('engineerId', String(engineerId))
    const qs = query.toString()
    return request<DispatchPackage[]>(`/api/dispatch-packages${qs ? '?' + qs : ''}`, {}, token)
  },

  getDispatchPackage: (id: number, token?: string) =>
    request<DispatchPackage>(`/api/dispatch-packages/${id}`, {}, token),

  createDispatchPackage: (data: { title?: string; priority?: string; scheduledDate?: string; executorType?: string; engineerId?: number; contractorId?: number; notes?: string; workItemIds: number[] }, token?: string) =>
    request<DispatchPackage>('/api/dispatch-packages', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateDispatchStatus: (id: number, status: string, token?: string) =>
    request<DispatchPackage>(`/api/dispatch-packages/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token),

  assignDispatchPackage: (id: number, engineerId?: number, contractorId?: number, token?: string) =>
    request<DispatchPackage>(`/api/dispatch-packages/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ engineerId, contractorId }),
    }, token),

  // ── Engineers ──
  getEngineers: (token?: string) =>
    request<Engineer[]>('/api/engineers', {}, token),

  getEngineer: (id: number, token?: string) =>
    request<Engineer>(`/api/engineers/${id}`, {}, token),

  createEngineer: (data: Partial<Engineer>, token?: string) =>
    request<Engineer>('/api/engineers', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateEngineer: (id: number, data: Partial<Engineer>, token?: string) =>
    request<Engineer>(`/api/engineers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  // ── Schedules ──
  getTodaySchedule: (token?: string) =>
    request<EngineerSchedule[]>('/api/schedules/today', {}, token),

  generateSchedule: (year: number, month: number, token?: string) =>
    request<{ created: number }>('/api/schedules/generate', {
      method: 'POST',
      body: JSON.stringify({ year, month }),
    }, token),

  // ── Contractors ──
  getContractors: (token?: string) =>
    request<Contractor[]>('/api/contractors', {}, token),

  createContractor: (data: Partial<Contractor>, token?: string) =>
    request<Contractor>('/api/contractors', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateContractor: (id: number, data: Partial<Contractor>, token?: string) =>
    request<Contractor>(`/api/contractors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  // ── Devices (existing) ──
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

  // ── Alerts (existing) ──
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

  // ── Tickets (existing) ──
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

  // ── Maintenance (existing) ──
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

// Re-export types that api methods depend on
export type DeviceStats = import('../types').DeviceStats
export type Alert = import('../types').Alert
export type AlertStats = import('../types').AlertStats
export type Ticket = import('../types').Ticket
export type TicketStats = import('../types').TicketStats
export type MaintenanceRecord = import('../types').MaintenanceRecord
export type MaintenanceStats = import('../types').MaintenanceStats
export type Customer = import('../types').Customer
export type Site = import('../types').Site
export type Unit = import('../types').Unit
export type MaintenanceItem = import('../types').MaintenanceItem
export type WorkItem = import('../types').WorkItem
export type DispatchPackage = import('../types').DispatchPackage
export type Engineer = import('../types').Engineer
export type EngineerSchedule = import('../types').EngineerSchedule
export type Contractor = import('../types').Contractor
export type PaymentRecord = import('../types').PaymentRecord
