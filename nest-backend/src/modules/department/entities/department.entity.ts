import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Category } from '../../category/entities/category.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('departments')
@Index(['name'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['code'], {
  unique: true,
  where:
    '"deleted_at" IS NULL AND "is_active" = true AND "department_code" IS NOT NULL',
})
@Index(['isActive'])
export class Department {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'department_name', length: 100 })
  @Expose()
  name: string;

  @Column({ name: 'department_code', length: 10, nullable: true })
  @Expose()
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description?: string | null;

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

  @OneToMany(() => Category, (category) => category.department)
  categories?: Category[];

  @OneToMany(() => Product, (product) => product.department)
  products?: Product[];
}
