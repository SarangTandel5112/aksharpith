import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_attributes')
@Index(['name'], { unique: true, where: '"deleted_at" IS NULL' })
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'name', length: 150 })
  @Expose()
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ProductAttributeValue, (v) => v.attribute, { cascade: true })
  values: ProductAttributeValue[];
}
