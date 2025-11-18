import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'department_name', type: 'varchar', length: 100, unique: true })
  @Index('uq_department_name', { unique: true })
  departmentName!: string;

  @Column({ name: 'department_code', type: 'varchar', length: 10, unique: true, nullable: true })
  @Index('uq_department_code', { unique: true })
  departmentCode!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index('idx_department_active')
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => Product, (product) => product.department)
  products!: Product[];
}
