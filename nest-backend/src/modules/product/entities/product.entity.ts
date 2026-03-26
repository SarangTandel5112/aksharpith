import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Department } from '../../department/entities/department.entity';
import { SubCategory } from '../../sub-category/entities/sub-category.entity';
import { ProductGroup } from '../../product-group/entities/product-group.entity';
import { ProductMedia } from './product-media.entity';
import { ProductMarketingMedia } from './product-marketing-media.entity';
import { ProductVendor } from './product-vendor.entity';
import { ProductZone } from './product-zone.entity';
import { ProductPhysicalAttributes } from './product-physical-attributes.entity';
import { ProductAttribute } from '../../product-attribute/entities/product-attribute.entity';
import { ProductVariant } from '../../product-variant/entities/product-variant.entity';
import { ProductGroupFieldValue } from './product-group-field-value.entity';

export enum ProductType {
  STANDARD = 'Standard',
  LOT_MATRIX = 'Lot Matrix',
  SIMPLE = 'Standard',
  VARIABLE = 'Lot Matrix',
  DIGITAL = 'Digital',
  SERVICE = 'Service',
}

@Entity('products')
@Index(['departmentId', 'subCategoryId'])
@Index(['isActive', 'itemInactive'])
@Index(['subCategoryId', 'isActive'])
@Index(['createdAt'])
@Index(['sku'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['upc'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true AND "upc_code" IS NOT NULL',
})
@Index(['name'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['departmentId'])
@Index(['subCategoryId'])
@Index(['model'])
@Index(['hsnCode'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'product_name', length: 150 })
  @Expose()
  name: string;

  @Column({ name: 'product_code', length: 10 })
  @Expose()
  sku: string;

  @Column({ name: 'upc_code', length: 20, nullable: true })
  @Expose()
  upc?: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  @Expose()
  description: string | null;

  @Column({
    name: 'product_type',
    type: 'varchar',
    length: 20,
    default: ProductType.STANDARD,
  })
  @Expose()
  productType: ProductType;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @Expose()
  basePrice: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Expose()
  model?: string | null;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  @Expose()
  stockQuantity: number;

  @Column({ name: 'department_id', nullable: true })
  @Expose()
  departmentId: string | null;

  @ManyToOne(() => Department, (department) => department.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id' })
  department?: Department | null;

  @Column({ name: 'sub_category_id', nullable: true })
  @Expose()
  subCategoryId: string | null;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory?: SubCategory | null;

  @Column({ name: 'group_id', nullable: true })
  @Expose()
  groupId: string | null;

  @ManyToOne(() => ProductGroup, (group) => group.products, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'group_id' })
  group?: ProductGroup | null;

  @Column({ name: 'hsn_code', length: 8, nullable: true })
  @Expose()
  hsnCode?: string | null;

  @Column({ name: 'non_taxable', type: 'boolean', default: false })
  @Expose()
  nonTaxable?: boolean;

  @Column({ name: 'item_inactive', type: 'boolean', default: false })
  @Expose()
  itemInactive: boolean;

  @Column({ name: 'non_stock_item', type: 'boolean', default: false })
  @Expose()
  nonStockItem?: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  @Expose()
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ProductMedia, (media) => media.product)
  media?: ProductMedia[];

  @OneToMany(
    () => ProductMarketingMedia,
    (marketingMedia) => marketingMedia.product,
  )
  marketingMedia?: ProductMarketingMedia[];

  @OneToMany(() => ProductVendor, (vendor) => vendor.product)
  vendors?: ProductVendor[];

  @OneToMany(() => ProductZone, (zone) => zone.product)
  zones?: ProductZone[];

  @OneToOne(
    () => ProductPhysicalAttributes,
    (attributes) => attributes.product,
  )
  physicalAttributes?: ProductPhysicalAttributes | null;

  @OneToMany(() => ProductAttribute, (attribute) => attribute.product)
  attributes?: ProductAttribute[];

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants?: ProductVariant[];

  @OneToMany(() => ProductGroupFieldValue, (value) => value.product)
  groupFieldValues?: ProductGroupFieldValue[];
}
