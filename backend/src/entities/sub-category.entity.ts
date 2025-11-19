import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { Product } from './product.entity';

@Entity('sub_categories')
@Index('uq_cat_subcat_name', ['categoryId', 'subCategoryName'], { unique: true })
@Index('idx_cat_active_order', ['categoryId', 'isActive', 'displayOrder'])
export class SubCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'sub_category_name', type: 'varchar', length: 100 })
  subCategoryName!: string;

  @Column({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo!: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  @Index('idx_display_order')
  displayOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => ProductCategory, (category) => category.subCategories, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: ProductCategory;

  @OneToMany(() => Product, (product) => product.subCategory)
  products!: Product[];
}
