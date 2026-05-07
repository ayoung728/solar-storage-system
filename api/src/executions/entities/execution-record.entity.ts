import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExecutionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  AWAITING_ACCEPTANCE = 'awaiting_acceptance',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AcceptanceStatus {
  PASSED = 'passed',
  PARTIAL = 'partial',
  FAILED = 'failed',
}

@Entity('execution_records')
export class ExecutionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dispatch_package_id' })
  dispatchPackageId: number;

  @Column({ name: 'executor_type' })
  executorType: string;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'customer_name', nullable: true })
  customerName: string;

  @Column({ name: 'customer_signature', type: 'text', nullable: true })
  customerSignature: string;

  @Column({ name: 'signed_at', nullable: true })
  signedAt: Date;

  @Column({ name: 'acceptance_status', nullable: true })
  acceptanceStatus: string;

  @Column({ name: 'acceptance_notes', type: 'text', nullable: true })
  acceptanceNotes: string;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt2: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
