import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum DispatchStatus {
  DRAFT = 'draft',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  AWAITING_ACCEPTANCE = 'awaiting_acceptance',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ExecutorType {
  INTERNAL = 'internal',
  CONTRACTOR = 'contractor',
}

@Entity('dispatch_packages')
export class DispatchPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'package_code', unique: true })
  packageCode: string;

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'executor_type', type: 'enum', enum: ExecutorType, default: ExecutorType.INTERNAL })
  executorType: ExecutorType;

  @Column({ name: 'engineer_id', nullable: true })
  engineerId: number;

  @Column({ name: 'contractor_id', nullable: true })
  contractorId: number;

  @Column({ type: 'enum', enum: DispatchStatus, default: DispatchStatus.DRAFT })
  status: DispatchStatus;

  @Column({ type: 'enum', enum: ['critical', 'high', 'medium', 'low'], default: 'medium' })
  priority: string;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: string;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
