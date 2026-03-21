import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_attributes')
@Index('uq_product_attribute_code', ['productId', 'attributeCode'], { unique: true })
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  @Index()
  productId!: number;

  @Column({ name: 'attribute_name', type: 'varchar', length: 50 })
  attributeName!: string;

  @Column({ name: 'attribute_code', type: 'varchar', length: 30 })
  attributeCode!: string;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  displayOrder!: number | null;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Product, (product) => product.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => ProductAttributeValue, (v) => v.attribute)
  values!: ProductAttributeValue[];
}
