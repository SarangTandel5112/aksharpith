import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';

@Entity('product_attribute_values')
@Index('uq_attribute_value_code', ['attributeId', 'valueCode'], { unique: true })
export class ProductAttributeValue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'attribute_id', type: 'int' })
  @Index()
  attributeId!: number;

  @Column({ name: 'value_label', type: 'varchar', length: 50 })
  valueLabel!: string;

  @Column({ name: 'value_code', type: 'varchar', length: 30 })
  valueCode!: string;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  displayOrder!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => ProductAttribute, (attr) => attr.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;
}
