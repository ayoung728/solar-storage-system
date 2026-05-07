import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('execution_photos')
export class ExecutionPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'execution_record_id' })
  executionRecordId: number;

  @Column({ name: 'work_item_id', nullable: true })
  workItemId: number;

  @Column({ name: 'step_order', nullable: true })
  stepOrder: number;

  @Column({ name: 'photo_type' })
  photoType: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
