import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductAttribute } from './product-attribute.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_variant_attributes')
@Index('uq_variant_attribute', ['variantId', 'attributeId'], { unique: true })
export class ProductVariantAttribute {
  @Column({ name: 'variant_id', type: 'int', primary: true })
  variantId!: number;

  @Column({ name: 'attribute_id', type: 'int', primary: true })
  attributeId!: number;

  @Column({ name: 'attribute_value_id', type: 'int' })
  attributeValueId!: number;

  @ManyToOne(() => ProductVariant, (v) => v.variantAttributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;

  @ManyToOne(() => ProductAttribute, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;

  @ManyToOne(() => ProductAttributeValue, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue!: ProductAttributeValue;
}
