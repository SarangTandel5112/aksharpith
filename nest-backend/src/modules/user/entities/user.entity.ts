import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';

@Entity('users')
@Index(['email'], { unique: true, where: '"deleted_at" IS NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'first_name', length: 100 })
  @Expose()
  firstName: string;

  @Column({ name: 'middle_name', length: 100, nullable: true })
  @Expose()
  middleName: string | null;

  @Column({ name: 'last_name', length: 100 })
  @Expose()
  lastName: string;

  @Column({ name: 'email', length: 255 })
  @Expose()
  email: string;

  @Column({ name: 'password', length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
