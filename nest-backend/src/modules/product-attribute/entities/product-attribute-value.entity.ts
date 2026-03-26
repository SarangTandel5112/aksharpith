import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ProductAttribute } from './product-attribute.entity';

@Entity('product_attribute_values')
@Index(['attributeId', 'code'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['attributeId'])
export class ProductAttributeValue {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'attribute_id' })
  attributeId: string;

  @ManyToOne(() => ProductAttribute, (a) => a.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: ProductAttribute;

  @Column({ name: 'value_label', length: 50 })
  @Expose()
  value: string;

  @Column({ name: 'value_code', length: 30 })
  @Expose()
  code?: string;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  @Expose()
  sortOrder: number | null;

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
}
