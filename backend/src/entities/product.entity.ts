import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_name', type: 'varchar' })
  productName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;

  @Column({ name: 'stock_quantity', type: 'int', nullable: true })
  stockQuantity!: number | null;

  @Column({ type: 'varchar', nullable: true })
  photo!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @ManyToOne('ProductCategory', 'products')
  @JoinColumn({ name: 'category_id' })
  category!: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;
}
