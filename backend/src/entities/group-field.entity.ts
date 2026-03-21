import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductGroup } from './product-group.entity';
import { GroupFieldOption } from './group-field-option.entity';
import { ProductGroupFieldValue } from './product-group-field-value.entity';

export const FIELD_TYPE = {
  TEXT: 'text', NUMBER: 'number', TEXTAREA: 'textarea',
  BOOLEAN: 'boolean', DROPDOWN: 'dropdown',
} as const;

@Entity('group_fields')
@Index('uq_group_field_key', ['groupId', 'fieldKey'], { unique: true })
export class GroupField {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'group_id', type: 'int' })
  @Index()
  groupId!: number;

  @Column({ name: 'field_name', type: 'varchar', length: 100 })
  fieldName!: string;

  @Column({ name: 'field_key', type: 'varchar', length: 100 })
  fieldKey!: string;

  @Column({ name: 'field_type', type: 'varchar', length: 30 })
  fieldType!: string;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ name: 'is_filterable', type: 'boolean', default: false })
  isFilterable!: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => ProductGroup, (group) => group.fields, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'group_id' })
  group!: ProductGroup;

  @OneToMany(() => GroupFieldOption, (opt) => opt.field)
  options!: GroupFieldOption[];

  @OneToMany(() => ProductGroupFieldValue, (v) => v.field)
  values!: ProductGroupFieldValue[];
}
