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

@Entity('product_zones')
@Index(['productId'])
@Index(['productId', 'isActive'])
@Index(['zoneCode'])
@Index(['productId', 'zoneCode'], {
  unique: true,
  where: '"is_active" = true AND "zone_code" IS NOT NULL',
})
export class ProductZone {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'product_id' }) productId: string;
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  @Column({ name: 'zone_name', length: 100 }) zoneName: string;
  @Column({ name: 'zone_code', length: 10, nullable: true })
  zoneCode: string | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}
