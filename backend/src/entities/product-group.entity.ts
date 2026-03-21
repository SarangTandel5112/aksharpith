import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { GroupField } from './group-field.entity';
import { Product } from './product.entity';

@Entity('product_groups')
export class ProductGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'group_name', type: 'varchar', length: 100, unique: true })
  groupName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => GroupField, (field) => field.group)
  fields!: GroupField[];

  @OneToMany(() => Product, (product) => product.group)
  products!: Product[];
}
