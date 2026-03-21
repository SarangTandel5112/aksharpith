import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { GroupField } from './group-field.entity';

@Entity('group_field_options')
@Index('uq_field_option_value', ['fieldId', 'optionValue'], { unique: true })
export class GroupFieldOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'field_id', type: 'int' })
  @Index()
  fieldId!: number;

  @Column({ name: 'option_label', type: 'varchar', length: 100 })
  optionLabel!: string;

  @Column({ name: 'option_value', type: 'varchar', length: 100 })
  optionValue!: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => GroupField, (field) => field.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field!: GroupField;
}
