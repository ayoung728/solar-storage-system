import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { DispatchPackage } from './dispatch-package.entity';
import { WorkItem } from '../../work-items/entities/work-item.entity';

@Entity('dispatch_package_items')
export class DispatchPackageItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'package_id' })
  packageId: number;

  @ManyToOne(() => DispatchPackage)
  @JoinColumn({ name: 'package_id' })
  package: DispatchPackage;

  @Column({ name: 'work_item_id' })
  workItemId: number;

  @ManyToOne(() => WorkItem)
  @JoinColumn({ name: 'work_item_id' })
  workItem: WorkItem;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
