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
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Department } from '../../department/entities/department.entity';
import { SubCategory } from '../../sub-category/entities/sub-category.entity';

@Entity('product_categories')
@Index(['name'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['departmentId'])
@Index(['isActive'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'category_name', length: 100 })
  @Expose()
  name: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  photo?: string | null;

  @Column({ name: 'department_id', nullable: true })
  @Expose()
  departmentId?: string | null;

  @ManyToOne(() => Department, (department) => department.categories, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id' })
  department?: Department | null;

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

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories?: SubCategory[];
}
