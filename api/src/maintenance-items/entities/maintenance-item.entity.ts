import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';

export enum FrequencyType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'half_yearly',
  YEARLY = 'yearly',
}

@Entity('maintenance_items')
export class MaintenanceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'unit_id' })
  unitId: number;

  @ManyToOne(() => Unit, unit => unit.maintenanceItems)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column()
  name: string;

  @Column({ name: 'frequency_type', type: 'enum', enum: FrequencyType })
  frequencyType: FrequencyType;

  @Column({ name: 'frequency_value', default: 1 })
  frequencyValue: number;

  @Column({ type: 'json', nullable: true })
  steps: any;

  @Column({ name: 'acceptance_criteria', type: 'json', nullable: true })
  acceptanceCriteria: any;

  @Column({ name: 'estimated_minutes', nullable: true })
  estimatedMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
