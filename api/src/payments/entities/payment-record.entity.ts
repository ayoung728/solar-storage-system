import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum PricingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  ITEMIZED = 'itemized',
}

@Entity('payment_records')
export class PaymentRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'execution_record_id' })
  executionRecordId: number;

  @Column({ name: 'contractor_id' })
  contractorId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING_APPROVAL })
  status: PaymentStatus;

  @Column({ name: 'pricing_type', nullable: true })
  pricingType: string;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ name: 'total_hours', type: 'decimal', precision: 5, scale: 1, nullable: true })
  totalHours: number;

  @Column({ type: 'json', nullable: true })
  items: any;

  @Column({ name: 'invoice_number', nullable: true })
  invoiceNumber: string;

  @Column({ name: 'invoice_date', type: 'date', nullable: true })
  invoiceDate: string;

  @Column({ name: 'paid_date', type: 'date', nullable: true })
  paidDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
