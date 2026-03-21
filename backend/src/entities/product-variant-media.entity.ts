import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('product_variant_media')
export class ProductVariantMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'variant_id', type: 'int' })
  @Index()
  variantId!: number;

  @Column({ name: 'media_url', type: 'varchar', length: 500 })
  mediaUrl!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  displayOrder!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => ProductVariant, (v) => v.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;
}
