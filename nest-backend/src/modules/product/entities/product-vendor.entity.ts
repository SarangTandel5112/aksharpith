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

@Entity('product_vendors')
@Index(['productId'])
@Index(['productId', 'isPrimary'])
@Index(['gstin'])
export class ProductVendor {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'product_id' }) productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'vendor_name', length: 150 }) vendorName: string;

  @Column({ name: 'contact_person', length: 100, nullable: true })
  contactPerson: string | null;

  @Column({ name: 'contact_email', length: 100, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string | null;

  @Column({ length: 15, nullable: true }) gstin: string | null;

  @Column({ type: 'text', nullable: true }) address: string | null;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true }) notes: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}
