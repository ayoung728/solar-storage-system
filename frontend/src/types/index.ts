     1|// Device types matching backend entity
     2|
     3|export type DeviceType = 'solar_panel' | 'battery_storage' | 'inverter' | 'monitoring'
     4|
     5|export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'warning'
     6|
     7|export interface Device {
     8|  id: number
     9|  deviceId: string
    10|  name: string
    11|  type: DeviceType
    12|  status: DeviceStatus
    13|  location?: string
    14|  installedDate?: string
    15|  lastMaintenanceDate?: string
    16|  manufacturer?: string
    17|  model?: string
    18|  firmwareVersion?: string
    19|  serialNumber?: string
    20|  specifications: Record<string, unknown>
    21|  telemetryData: Record<string, unknown>
    22|  createdAt?: string
    23|  updatedAt?: string
    24|}
    25|
    26|export interface DeviceStats {
    27|  total: number
    28|  online: number
    29|  offline: number
    30|  maintenance: number
    31|  warning: number
    32|}
    33|
    34|// Alert types matching backend entity
    35|
    36|export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
    37|
    38|export type AlertType = 'device_offline' | 'temperature_warning' | 'power_anomaly' | 'efficiency_drop' | 'battery_degradation' | 'system_error'
    39|
    40|export type AlertStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed'
    41|
    42|export interface Alert {
    43|  id: number
    44|  deviceId?: number
    45|  deviceName?: string
    46|  message: string
    47|  severity: AlertSeverity
    48|  type: AlertType
    49|  status: AlertStatus
    50|  acknowledgedAt?: string
    51|  resolvedAt?: string
    52|  createdAt: string
    53|  updatedAt: string
    54|}
    55|
    56|export interface AlertStats {
    57|  total: number
    58|  open: number
    59|  acknowledged: number
    60|  inProgress: number
    61|  resolved: number
    62|  critical: number
    63|}
    64|
    65|// Ticket types matching backend entity
    66|
    67|export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'
    68|
    69|export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
    70|
    71|export interface Ticket {
    72|  id: number
    73|  title: string
    74|  description: string
    75|  priority: TicketPriority
    76|  status: TicketStatus
    77|  assignee?: string
    78|  deviceName?: string
    79|  createdAt: string
    80|  updatedAt: string
    81|}
    82|
    83|export interface TicketStats {
    84|  total: number
    85|  open: number
    86|  inProgress: number
    87|  resolved: number
    88|  closed: number
    89|}
    90|
    91|// Maintenance types matching backend entity
    92|
    93|export type MaintenanceType = 'routine' | 'repair' | 'inspection'
    94|
    95|export type MaintenanceStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    96|
    97|export interface MaintenanceRecord {
    98|  id: number
    99|  deviceName?: string
   100|  taskType: MaintenanceType
   101|  status: MaintenanceStatus
   102|  scheduledDate: string
   103|  completedDate?: string
   104|  technician?: string
   105|  notes?: string
   106|  actualCost?: number
   107|  estimatedDuration: number
   108|  createdAt: string
   109|  updatedAt: string
   110|}
   111|
   112|export interface MaintenanceStats {
   113|  total: number
   114|  pending: number
   115|  inProgress: number
   116|  completed: number
   117|  cancelled: number
   118|}
   119|
   120|// Auth types
   121|
   122|export interface User {
   123|  id: number
   124|  username: string
   125|  role?: string
   126|}
   127|
   128|export interface LoginResponse {
   129|  accessToken: string
   130|}
   131|