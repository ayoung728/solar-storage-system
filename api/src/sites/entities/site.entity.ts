import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Device } from '../../devices/entities/device.entity';

export enum SiteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CONSTRUCTING = 'constructing',
}

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer, customer => customer.sites)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  name: string;

  @Column({ name: 'site_type' })
  siteType: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'capacity_kwp', type: 'decimal', precision: 10, scale: 2, nullable: true })
  capacityKwp: number;

  @Column({ name: 'installed_date', type: 'date', nullable: true })
  installedDate: string;

  @Column({ type: 'enum', enum: SiteStatus, default: SiteStatus.ACTIVE })
  status: SiteStatus;

  @OneToMany(() => Device, device => device.site)
  devices: Device[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
