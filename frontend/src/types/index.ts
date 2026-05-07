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
  siteId?: number
  code?: string
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
  units?: Unit[]
  site?: Site
}

export interface DeviceStats {
  total: number
  online: number
  offline: number
  maintenance: number
  warning: number
}

// Customer types

export interface Customer {
  id: number
  code: string
  name: string
  taxId?: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  status: 'active' | 'inactive'
  sites?: Site[]
  createdAt?: string
  updatedAt?: string
}

// Site types

export interface Site {
  id: number
  code: string
  customerId: number
  customer?: Customer
  name: string
  siteType: string
  address?: string
  latitude?: number
  longitude?: number
  capacityKwp?: number
  installedDate?: string
  status: 'active' | 'inactive' | 'constructing'
  devices?: Device[]
  createdAt?: string
  updatedAt?: string
}

// Unit types

export interface Unit {
  id: number
  deviceId: number
  code: string
  name: string
  unitType: string
  specifications?: Record<string, unknown>
  status: 'active' | 'inactive' | 'retired'
  maintenanceItems?: MaintenanceItem[]
  createdAt?: string
  updatedAt?: string
}

export interface MaintenanceItem {
  id: number
  unitId: number
  name: string
  frequencyType: 'weekly' | 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'
  frequencyValue: number
  steps?: MaintenanceStep[]
  acceptanceCriteria?: AcceptanceCriterion[]
  estimatedMinutes?: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface MaintenanceStep {
  order: number
  description: string
  estMin?: number
  tools?: string[]
}

export interface AcceptanceCriterion {
  order: number
  item: string
  condition: string
  range?: { min?: number; max?: number; unit?: string }
}

export interface WorkItem {
  id: number
  sourceType: 'maintenance_plan' | 'device_alert' | 'customer_ticket' | 'manual'
  sourceId?: number
  title: string
  description?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  siteId?: number
  deviceId?: number
  unitId?: number
  maintenanceItemId?: number
  status: 'pending' | 'in_pool' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  estimatedMinutes?: number
  actualMinutes?: number
  createdAt?: string
}

export interface DispatchPackage {
  id: number
  packageCode: string
  title?: string
  executorType: 'internal' | 'contractor'
  engineerId?: number
  contractorId?: number
  status: 'draft' | 'assigned' | 'accepted' | 'in_progress' | 'awaiting_acceptance' | 'completed' | 'cancelled'
  priority: string
  scheduledDate?: string
  completedDate?: string
  notes?: string
  dispatchPackageItems?: DispatchPackageItem[]
  createdAt?: string
}

export interface DispatchPackageItem {
  id: number
  packageId: number
  workItemId: number
  sortOrder: number
  workItem?: WorkItem
}

export interface Engineer {
  id: number
  userId?: number
  employeeId: string
  fullName: string
  phone?: string
  email?: string
  shiftGroup: 'day' | 'night' | 'backup'
  isActive: boolean
  createdAt?: string
}

export interface EngineerSchedule {
  id: number
  engineerId: number
  workDate: string
  shift: 'day' | 'night' | 'backup'
  note?: string
  engineer?: Engineer
}

export interface Contractor {
  id: number
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  taxId?: string
  isActive: boolean
  bankName?: string
  bankAccount?: string
}

export interface PaymentRecord {
  id: number
  executionRecordId: number
  contractorId: number
  amount: number
  status: 'pending_approval' | 'approved' | 'paid' | 'cancelled'
  pricingType?: 'fixed' | 'hourly' | 'itemized'
  invoiceNumber?: string
  paidDate?: string
  notes?: string
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

// DeviceFormData used by DeviceDetailPage

export interface DeviceFormData {
  name: string
  deviceId: string
  type: string
  status: string
  location: string
  manufacturer: string
  model: string
  firmwareVersion: string
  installedDate: string
  serialNumber: string
}
