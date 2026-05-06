import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  UNRESOLVED = 'unresolved',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_id', nullable: true })
  deviceId?: number;

  @Column({ name: 'severity', type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'status', type: 'enum', enum: AlertStatus, default: AlertStatus.UNRESOLVED })
  status: AlertStatus;

  @Column({ name: 'acknowledged_by', nullable: true })
  acknowledgedBy?: number;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
