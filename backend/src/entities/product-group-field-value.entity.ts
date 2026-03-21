import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { GroupField } from './group-field.entity';
import { GroupFieldOption } from './group-field-option.entity';

@Entity('product_group_field_values')
@Index('uq_product_field_value', ['productId', 'fieldId'], { unique: true })
export class ProductGroupFieldValue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  @Index()
  productId!: number;

  @Column({ name: 'field_id', type: 'int' })
  @Index()
  fieldId!: number;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText!: string | null;

  @Column({ name: 'value_number', type: 'decimal', precision: 12, scale: 2, nullable: true })
  valueNumber!: number | null;

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean!: boolean | null;

  @Column({ name: 'value_option_id', type: 'int', nullable: true })
  valueOptionId!: number | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => GroupField, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'field_id' })
  field!: GroupField;

  @ManyToOne(() => GroupFieldOption, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'value_option_id' })
  valueOption!: GroupFieldOption | null;
}
