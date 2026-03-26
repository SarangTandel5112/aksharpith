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
import { ProductGroupFieldValue } from '../../product/entities/product-group-field-value.entity';

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DROPDOWN = 'dropdown',
}

@Entity('group_fields')
@Index(['groupId'])
@Index(['groupId', 'fieldKey'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
export class GroupField {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'group_id' })
  groupId: string;

  @ManyToOne(() => ProductGroup, (g) => g.fields, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'group_id' })
  group: ProductGroup;

  @Column({ name: 'field_name', length: 100 })
  @Expose()
  fieldName: string;

  @Column({
    name: 'field_type',
    type: 'varchar',
    length: 30,
    default: FieldType.TEXT,
  })
  @Expose()
  fieldType: FieldType;

  @Column({ name: 'field_key', length: 100 })
  @Expose()
  fieldKey: string;

  @Column({ name: 'is_filterable', type: 'boolean', default: false })
  @Expose()
  isFilterable: boolean;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  @Expose()
  isRequired: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  @Expose()
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive?: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  @Expose()
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => GroupFieldOption, (o) => o.field, { cascade: true })
  @Expose()
  options: GroupFieldOption[];

  @OneToMany(() => ProductGroupFieldValue, (value) => value.field)
  values?: ProductGroupFieldValue[];
}
