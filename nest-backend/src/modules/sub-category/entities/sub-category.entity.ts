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
import { Category } from '../../category/entities/category.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('sub_categories')
@Index(['categoryId', 'name'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['categoryId', 'isActive', 'sortOrder'])
@Index(['sortOrder'])
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'sub_category_name', length: 100 })
  @Expose()
  name: string;

  @Column({ name: 'category_id' })
  @Expose()
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Expose()
  photo?: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  @Expose()
  sortOrder?: number;

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

  @OneToMany(() => Product, (product) => product.subCategory)
  products?: Product[];
}
