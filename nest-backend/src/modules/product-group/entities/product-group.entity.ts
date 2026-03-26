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
import { GroupField } from './group-field.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('product_groups')
@Index(['name'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
export class ProductGroup {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'group_name', length: 100 })
  @Expose()
  name: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  description?: string | null;

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

  @OneToMany(() => GroupField, (f) => f.group, { cascade: true })
  fields: GroupField[];

  @OneToMany(() => Product, (product) => product.group)
  products?: Product[];
}
