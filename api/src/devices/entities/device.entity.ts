import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DeviceType {
  SOLAR_PANEL = 'solar_panel',
  BATTERY_STORAGE = 'battery_storage',
  INVERTER = 'inverter',
  MONITORING = 'monitoring'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  WARNING = 'warning',
  ERROR = 'error'
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', unique: true })
  serialNumber: string;

  @Column({ name: 'device_type', type: 'enum', enum: DeviceType })
  deviceType: DeviceType;

  @Column({ name: 'status', type: 'enum', enum: DeviceStatus, default: DeviceStatus.OFFLINE })
  status: DeviceStatus;

  @Column({ name: 'location', nullable: true })
  location?: string;

  @Column({ name: 'specifications', type: 'json', nullable: true })
  specifications?: any;

  @Column({ name: 'telemetry_data', type: 'json', nullable: true })
  telemetryData?: any;

  @Column({ name: 'last_seen', nullable: true })
  lastSeenAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
