import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariantAttribute } from './product-variant-attribute.entity';
import { ProductVariantMedia } from './product-variant-media.entity';

@Entity('product_variants')
@Index('uq_product_combination_hash', ['productId', 'combinationHash'], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  @Index()
  productId!: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 30, unique: true, nullable: true })
  upc!: string | null;

  @Column({ name: 'combination_hash', type: 'varchar', length: 150 })
  combinationHash!: string;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice!: number | null;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  unitPrice!: number | null;

  @Column({ name: 'sale_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salePrice!: number | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => ProductVariantAttribute, (va) => va.variant, { cascade: true })
  variantAttributes!: ProductVariantAttribute[];

  @OneToMany(() => ProductVariantMedia, (m) => m.variant)
  media!: ProductVariantMedia[];
}
