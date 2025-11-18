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

@Entity('product_media')
@Index('idx_media_product', ['productId'])
@Index('uq_product_display_order', ['productId', 'displayOrder'], { unique: true })
@Index('idx_product_primary', ['productId', 'isPrimary'])
export class ProductMedia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  productId!: number;

  @Column({ name: 'media_url', type: 'varchar', length: 500 })
  mediaUrl!: string;

  @Column({ name: 'media_type', type: 'varchar', length: 20 })
  mediaType!: string; // 'photo' only

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number; // 0-5 (max 6 photos)

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize!: number | null;

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, (product) => product.media, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
