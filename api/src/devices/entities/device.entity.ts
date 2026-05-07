import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Site } from '../../sites/entities/site.entity';
import { Unit } from '../../units/entities/unit.entity';

export enum DeviceType {
  SOLAR_PANEL = 'solar_panel',
  BATTERY = 'battery',
  INVERTER = 'inverter',
  MONITOR = 'monitor',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  WARNING = 'warning',
  ERROR = 'error',
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  code: string;

  @Column({ name: 'site_id', nullable: true })
  siteId: number;

  @ManyToOne(() => Site, site => site.devices)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @OneToMany(() => Unit, unit => unit.device)
  units: Unit[];

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'device_type', type: 'enum', enum: DeviceType })
  deviceType: DeviceType;

  @Column({ type: 'enum', enum: DeviceStatus, default: DeviceStatus.OFFLINE })
  status: DeviceStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @Column({ name: 'installed_date', nullable: true })
  installedDate: string;

  @Column({ type: 'json', nullable: true })
  specifications: any;

  @Column({ name: 'telemetry_data', type: 'json', nullable: true })
  telemetryData: any;

  @Column({ name: 'last_seen', nullable: true })
  lastSeenAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
