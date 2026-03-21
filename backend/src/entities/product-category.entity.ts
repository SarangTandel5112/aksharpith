import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SubCategory } from './sub-category.entity';
import { Department } from './department.entity';

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'category_name', type: 'varchar', length: 100, unique: true })
  @Index('uq_category_name', { unique: true })
  categoryName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo!: string | null;

  @Column({ name: 'department_id', type: 'int', nullable: true })
  @Index('idx_category_department')
  departmentId!: number | null;

  @ManyToOne(() => Department, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'department_id' })
  department!: Department | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index('idx_category_active')
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories!: SubCategory[];
}
