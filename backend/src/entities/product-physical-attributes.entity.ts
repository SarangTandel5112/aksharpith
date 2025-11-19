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

@Entity('product_physical_attributes')
@Index('idx_physical_product', ['productId'])
export class ProductPhysicalAttributes {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  productId!: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  height!: string | null; // Format: "value unit" e.g. "10 cm"

  @Column({ type: 'varchar', length: 30, nullable: true })
  length!: string | null; // Format: "value unit" e.g. "20 cm"

  @Column({ type: 'varchar', length: 30, nullable: true })
  width!: string | null; // Format: "value unit" e.g. "15 cm"

  @Column({ type: 'varchar', length: 30, nullable: true })
  weight!: string | null; // Format: "value unit" e.g. "500 gm"

  @Column({ type: 'varchar', length: 30, nullable: true })
  color!: string | null; // e.g. "Red", "Blue", "#FF0000"

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, (product) => product.physicalAttributes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
