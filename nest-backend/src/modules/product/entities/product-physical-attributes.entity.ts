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

  @Column({ name: 'weight', type: 'varchar', length: 30, nullable: true })
  @Expose()
  weight: string | number | null;

  @Column({ name: 'length', type: 'varchar', length: 30, nullable: true })
  @Expose()
  length: string | number | null;

  @Column({ name: 'width', type: 'varchar', length: 30, nullable: true })
  @Expose()
  width: string | number | null;

  @Column({ name: 'height', type: 'varchar', length: 30, nullable: true })
  @Expose()
  height: string | number | null;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  @Expose()
  updatedAt: Date | null;
}
