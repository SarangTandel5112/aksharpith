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
import { GroupField } from '../../product-group/entities/group-field.entity';
import { GroupFieldOption } from '../../product-group/entities/group-field-option.entity';

@Entity('product_group_field_values')
@Index(['productId', 'fieldId'], { unique: true })
@Index(['productId'])
@Index(['fieldId'])
export class ProductGroupFieldValue {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'product_id' }) productId: string;
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'field_id' }) fieldId: string;
  @ManyToOne(() => GroupField, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'field_id' })
  field: GroupField;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText: string | null;

  @Column({
    name: 'value_number',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  valueNumber: number | null;

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean: boolean | null;

  @Column({ name: 'value_option_id', nullable: true })
  valueOptionId: string | null;

  @ManyToOne(() => GroupFieldOption, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'value_option_id' })
  valueOption: GroupFieldOption | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}
