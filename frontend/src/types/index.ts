// Device types matching backend entity

export type DeviceType = 'solar_panel' | 'battery_storage' | 'inverter' | 'monitoring'

export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'warning'

export interface Device {
  id: number
  deviceId: string
  name: string
  type: DeviceType
  status: DeviceStatus
  location?: string
  installedDate?: string
  lastMaintenanceDate?: string
  manufacturer?: string
  model?: string
  firmwareVersion?: string
  serialNumber?: string
  specifications: Record<string, unknown>
  telemetryData: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface DeviceStats {
  total: number
  online: number
  offline: number
  maintenance: number
  warning: number
}

// Alert types matching backend entity

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AlertType = 'device_offline' | 'temperature_warning' | 'power_anomaly' | 'efficiency_drop' | 'battery_degradation' | 'system_error'

export type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed'

export interface Alert {
  id: number
  deviceId?: number
  deviceName?: string
  message: string
  severity: AlertSeverity
  type: AlertType
  status: AlertStatus
  acknowledgedAt?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AlertStats {
  total: number
  open: number
  acknowledged: number
  inProgress: number
  resolved: number
  critical: number
}

// Ticket types matching backend entity

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Ticket {
  id: number
  title: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  assignee?: string
  deviceName?: string
  createdAt: string
  updatedAt: string
}

export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
}

// Maintenance types matching backend entity

export type MaintenanceType = 'routine' | 'repair' | 'inspection'

export type MaintenanceStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface MaintenanceRecord {
  id: number
  deviceName?: string
  taskType: MaintenanceType
  status: MaintenanceStatus
  scheduledDate: string
  completedDate?: string
  technician?: string
  notes?: string
  actualCost?: number
  estimatedDuration: number
  createdAt: string
  updatedAt: string
}

export interface MaintenanceStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  cancelled: number
}

// Auth types

export interface User {
  id: number
  username: string
  role?: string
}

export interface LoginResponse {
  accessToken: string
}
