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
import { Expose } from 'class-transformer';
import { Product } from './product.entity';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

@Entity('product_media')
@Index(['productId'])
@Index(['productId', 'sortOrder'], { unique: true })
@Index(['productId', 'isPrimary'])
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'media_url', length: 500 })
  @Expose()
  url: string;

  @Column({
    name: 'media_type',
    type: 'varchar',
    length: 20,
    default: MediaType.PHOTO,
  })
  @Expose()
  mediaType: MediaType;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  @Expose()
  sortOrder: number;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  @Expose()
  isPrimary: boolean;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  @Expose()
  fileSize: number | null;

  @Column({ name: 'file_name', length: 255, nullable: true })
  @Expose()
  fileName: string | null;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  @Expose()
  updatedAt: Date | null;
}
