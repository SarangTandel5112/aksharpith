import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  Index, ManyToOne, JoinColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Category } from '../../category/entities/category.entity';

@Entity('sub_categories')
@Index(['name', 'categoryId'], { unique: true, where: '"deleted_at" IS NULL' })
@Index(['categoryId'])
export class SubCategory {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'name', length: 150 })
  @Expose()
  name: string;

  @Column({ name: 'category_id' })
  @Expose()
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

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
}
