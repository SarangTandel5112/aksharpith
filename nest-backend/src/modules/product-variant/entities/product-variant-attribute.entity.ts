import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { ProductAttribute } from '../../product-attribute/entities/product-attribute.entity';
import { ProductAttributeValue } from '../../product-attribute/entities/product-attribute-value.entity';

@Entity('product_variant_attributes')
export class ProductVariantAttribute {
  @PrimaryColumn({ name: 'variant_id' })
  variantId: string;

  @PrimaryColumn({ name: 'attribute_id' })
  attributeId: string;

  @ManyToOne(() => ProductVariant, (v) => v.variantAttributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @ManyToOne(() => ProductAttribute)
  @JoinColumn({ name: 'attribute_id' })
  attribute: ProductAttribute;

  @Column({ name: 'attribute_value_id' })
  attributeValueId: string;

  @ManyToOne(() => ProductAttributeValue)
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue: ProductAttributeValue;
}
