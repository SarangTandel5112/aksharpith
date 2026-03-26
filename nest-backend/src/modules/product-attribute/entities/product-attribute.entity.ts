import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ProductAttributeValue } from './product-attribute-value.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('product_attributes')
@Index(['productId'])
@Index(['productId', 'code'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'product_id', nullable: true })
  @Expose()
  productId?: string | null;

  @ManyToOne(() => Product, (product) => product.attributes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  @Column({ name: 'attribute_name', length: 50 })
  @Expose()
  name: string;

  @Column({ name: 'attribute_code', length: 30 })
  @Expose()
  code?: string;

  @Column({ name: 'display_order', type: 'int', nullable: true })
  @Expose()
  sortOrder?: number | null;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  @Expose()
  isRequired?: boolean;

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

  @OneToMany(() => ProductAttributeValue, (v) => v.attribute, { cascade: true })
  values?: ProductAttributeValue[];
}
