import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum WorkItemSource {
  MAINTENANCE_PLAN = 'maintenance_plan',
  DEVICE_ALERT = 'device_alert',
  CUSTOMER_TICKET = 'customer_ticket',
  MANUAL = 'manual',
}

export enum WorkItemStatus {
  PENDING = 'pending',
  IN_POOL = 'in_pool',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('work_items')
export class WorkItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'source_type', type: 'enum', enum: WorkItemSource })
  sourceType: WorkItemSource;

  @Column({ name: 'source_id', nullable: true })
  sourceId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({ name: 'site_id', nullable: true })
  siteId: number;

  @Column({ name: 'device_id', nullable: true })
  deviceId: number;

  @Column({ name: 'unit_id', nullable: true })
  unitId: number;

  @Column({ name: 'maintenance_item_id', nullable: true })
  maintenanceItemId: number;

  @Column({ type: 'enum', enum: WorkItemStatus, default: WorkItemStatus.PENDING })
  status: WorkItemStatus;

  @Column({ name: 'estimated_minutes', nullable: true })
  estimatedMinutes: number;

  @Column({ name: 'actual_minutes', nullable: true })
  actualMinutes: number;

  @Column({ type: 'json', nullable: true })
  result: any;

  @Column({ name: 'result_notes', type: 'text', nullable: true })
  resultNotes: string;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
