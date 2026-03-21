import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Product } from './product.entity';

@Entity('product_physical_attributes')
export class ProductPhysicalAttributes {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @OneToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'weight', type: 'decimal', precision: 10, scale: 3, nullable: true })
  @Expose()
  weight: number | null;

  @Column({ name: 'length', type: 'decimal', precision: 10, scale: 3, nullable: true })
  @Expose()
  length: number | null;

  @Column({ name: 'width', type: 'decimal', precision: 10, scale: 3, nullable: true })
  @Expose()
  width: number | null;

  @Column({ name: 'height', type: 'decimal', precision: 10, scale: 3, nullable: true })
  @Expose()
  height: number | null;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;
}
