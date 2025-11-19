import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_marketing_media')
@Index('idx_marketing_media_product', ['productId'])
@Index('idx_marketing_display_order', ['productId', 'displayOrder'])
export class ProductMarketingMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  productId!: number;

  @Column({ name: 'media_url', type: 'varchar', length: 500 })
  mediaUrl!: string;

  @Column({ name: 'media_type', type: 'varchar', length: 20 })
  mediaType!: string; // 'photo' or 'video'

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'int', nullable: true })
  duration!: number | null; // Video duration in seconds

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, (product) => product.marketingMedia, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
