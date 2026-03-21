import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ProductGroup } from './product-group.entity';
import { GroupFieldOption } from './group-field-option.entity';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
}

@Entity('group_fields')
@Index(['groupId'])
export class GroupField {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'group_id' })
  groupId: string;

  @ManyToOne(() => ProductGroup, (g) => g.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: ProductGroup;

  @Column({ name: 'field_name', length: 150 })
  @Expose()
  fieldName: string;

  @Column({ name: 'field_type', type: 'enum', enum: FieldType, default: FieldType.TEXT })
  @Expose()
  fieldType: FieldType;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  @Expose()
  isRequired: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @Expose()
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => GroupFieldOption, (o) => o.field, { cascade: true })
  @Expose()
  options: GroupFieldOption[];
}
