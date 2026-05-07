import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Device } from '../../devices/entities/device.entity';
import { MaintenanceItem } from '../../maintenance-items/entities/maintenance-item.entity';

export enum UnitStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RETIRED = 'retired',
}

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ name: 'device_id' })
  deviceId: number;

  @ManyToOne(() => Device, device => device.units)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column()
  name: string;

  @Column({ name: 'unit_type' })
  unitType: string;

  @Column({ type: 'json', nullable: true })
  specifications: any;

  @Column({ type: 'enum', enum: UnitStatus, default: UnitStatus.ACTIVE })
  status: UnitStatus;

  @OneToMany(() => MaintenanceItem, mi => mi.unit)
  maintenanceItems: MaintenanceItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
