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

@Entity('product_vendors')
@Index('idx_vendor_product', ['productId'])
@Index('idx_vendor_primary', ['productId', 'isPrimary'])
@Index('idx_gstin', ['gstin'])
export class ProductVendor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  productId!: number;

  @Column({ name: 'vendor_name', type: 'varchar', length: 150 })
  vendorName!: string;

  @Column({ name: 'contact_person', type: 'varchar', length: 100, nullable: true })
  contactPerson!: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 100, nullable: true })
  contactEmail!: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true })
  contactPhone!: string | null;

  @Column({ type: 'varchar', length: 15, nullable: true })
  gstin!: string | null; // GST Identification Number (exactly 15 characters)

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean; // Only one primary vendor per product

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, (product) => product.vendors, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
