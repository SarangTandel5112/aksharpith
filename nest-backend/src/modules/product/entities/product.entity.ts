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
import { Expose } from 'class-transformer';
import { Department } from '../../department/entities/department.entity';
import { SubCategory } from '../../sub-category/entities/sub-category.entity';

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  DIGITAL = 'digital',
  SERVICE = 'service',
}

@Entity('products')
@Index(['sku'], { unique: true, where: '"deleted_at" IS NULL' })
@Index(['departmentId'])
@Index(['subCategoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'name', length: 255 })
  @Expose()
  name: string;

  @Column({ name: 'sku', length: 100 })
  @Expose()
  sku: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  @Expose()
  description: string | null;

  @Column({ name: 'product_type', type: 'enum', enum: ProductType, default: ProductType.SIMPLE })
  @Expose()
  productType: ProductType;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  @Expose()
  basePrice: number;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  @Expose()
  stockQuantity: number;

  @Column({ name: 'department_id', nullable: true })
  @Expose()
  departmentId: string | null;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'sub_category_id', nullable: true })
  @Expose()
  subCategoryId: string | null;

  @ManyToOne(() => SubCategory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  @Column({ name: 'group_id', nullable: true })
  @Expose()
  groupId: string | null;

  @Column({ name: 'item_inactive', type: 'boolean', default: false })
  @Expose()
  itemInactive: boolean;

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
