import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Product } from '../../product/entities/product.entity';
import { ProductVariantAttribute } from './product-variant-attribute.entity';
import { ProductVariantMedia } from './product-variant-media.entity';

@Entity('product_variants')
@Index(['productId'])
@Index(['combinationHash'])
@Index(['productId', 'combinationHash'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['sku'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['upc'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true AND "upc" IS NOT NULL',
})
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'product_id' })
  @Expose()
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'sku', length: 30 })
  @Expose()
  sku: string;

  @Column({ name: 'upc', length: 30, nullable: true })
  @Expose()
  upc?: string | null;

  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @Expose()
  cost?: number | null;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @Expose()
  price: number | null;

  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @Expose()
  salePrice?: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  @Expose()
  stockQuantity: number;

  @Column({ name: 'combination_hash', type: 'varchar', length: 150 })
  @Expose()
  combinationHash: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  @Expose()
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  @Expose()
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ProductVariantAttribute, (va) => va.variant, { cascade: true })
  @Expose()
  variantAttributes: ProductVariantAttribute[];

  @OneToMany(() => ProductVariantMedia, (m) => m.variant)
  media: ProductVariantMedia[];
}
