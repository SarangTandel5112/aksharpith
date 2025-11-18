import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Department } from './department.entity';
import { SubCategory } from './sub-category.entity';
import { ProductMedia } from './product-media.entity';
import { ProductMarketingMedia } from './product-marketing-media.entity';
import { ProductVendor } from './product-vendor.entity';
import { ProductZone } from './product-zone.entity';
import { ProductPhysicalAttributes } from './product-physical-attributes.entity';

@Entity('products')
@Index('idx_dept_subcat', ['departmentId', 'subCategoryId'])
@Index('idx_active_items', ['isActive', 'itemInactive'])
@Index('idx_subcat_active', ['subCategoryId', 'isActive'])
@Index('idx_created', ['createdAt'])
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  // Phase 1: Core Product Fields
  @Column({ name: 'product_code', type: 'varchar', length: 10, unique: true })
  @Index('uq_product_code', { unique: true })
  productCode!: string;

  @Column({ name: 'upc_code', type: 'varchar', length: 20, unique: true })
  @Index('uq_upc_code', { unique: true })
  upcCode!: string;

  @Column({ name: 'product_name', type: 'varchar', length: 150 })
  productName!: string;

  @Column({ name: 'product_type', type: 'varchar', length: 20, nullable: true })
  productType!: string | null; // 'Standard' or 'Lot Matrix'

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index('idx_model')
  model!: string | null;

  @Column({ name: 'department_id', type: 'int' })
  departmentId!: number;

  @Column({ name: 'sub_category_id', type: 'int' })
  subCategoryId!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  size!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pack!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vintage!: string | null;

  @Column({ name: 'hsn_code', type: 'varchar', length: 8 })
  @Index('idx_hsn_code')
  hsnCode!: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity!: number;

  // GST Fields
  @Column({ name: 'gst_1_sgst', type: 'boolean', default: false })
  gst1Sgst!: boolean;

  @Column({ name: 'gst_1_slab', type: 'varchar', length: 10 })
  gst1Slab!: string;

  @Column({ name: 'gst_2_cgst', type: 'boolean', default: false })
  gst2Cgst!: boolean;

  @Column({ name: 'gst_2_slab', type: 'varchar', length: 10 })
  gst2Slab!: string;

  @Column({ name: 'gst_3_igst', type: 'boolean', default: false })
  gst3Igst!: boolean;

  @Column({ name: 'gst_3_slab', type: 'varchar', length: 10 })
  gst3Slab!: string;

  @Column({ name: 'non_taxable', type: 'boolean', default: false })
  nonTaxable!: boolean;

  @Column({ name: 'item_inactive', type: 'boolean', default: false })
  itemInactive!: boolean;

  @Column({ name: 'non_stock_item', type: 'boolean', default: false })
  nonStockItem!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  // Relationships
  @ManyToOne(() => Department, (department) => department.products, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department!: Department;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory!: SubCategory;

  @OneToMany(() => ProductMedia, (media) => media.product)
  media!: ProductMedia[];

  @OneToMany(() => ProductMarketingMedia, (marketingMedia) => marketingMedia.product)
  marketingMedia!: ProductMarketingMedia[];

  @OneToMany(() => ProductVendor, (vendor) => vendor.product)
  vendors!: ProductVendor[];

  @OneToMany(() => ProductZone, (zone) => zone.product)
  zones!: ProductZone[];

  @OneToMany(() => ProductPhysicalAttributes, (attributes) => attributes.product)
  physicalAttributes!: ProductPhysicalAttributes[];
}
