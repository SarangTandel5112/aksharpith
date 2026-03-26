import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

export enum MarketingMediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

@Entity('product_marketing_media')
@Index(['productId'])
@Index(['productId', 'displayOrder'])
export class ProductMarketingMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'media_url', length: 500 })
  mediaUrl: string;

  @Column({
    name: 'media_type',
    type: 'varchar',
    length: 20,
    default: MarketingMediaType.PHOTO,
  })
  mediaType: MarketingMediaType;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}
