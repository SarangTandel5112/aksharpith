import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

export enum VariantMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('product_variant_media')
@Index(['variantId'])
export class ProductVariantMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id' })
  variantId: string;

  @ManyToOne(() => ProductVariant, (v) => v.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ name: 'media_url', length: 500 })
  url: string;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: VariantMediaType,
    default: VariantMediaType.IMAGE,
  })
  mediaType: VariantMediaType;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  sortOrder: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
