import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  MAINTENANCE = 'maintenance'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'username', unique: true })
  username: string

  @Column({ name: 'password_hash' })
  password: string // bcrypt hashed

  @Column({ name: 'full_name', nullable: true })
  fullName: string

  @Column({ name: 'email', nullable: true })
  email: string

  @Column({ name: 'role', type: 'enum', enum: UserRole, default: UserRole.OPERATOR })
  role: UserRole

  @Column({ name: 'is_active', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
