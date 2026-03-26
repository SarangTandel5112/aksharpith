import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { GroupField } from './group-field.entity';

@Entity('group_field_options')
@Index(['fieldId'])
@Index(['fieldId', 'optionValue'], {
  unique: true,
  where: '"is_active" = true',
})
export class GroupFieldOption {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'field_id' })
  fieldId: string;

  @ManyToOne(() => GroupField, (f) => f.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: GroupField;

  @Column({ name: 'option_label', length: 100 })
  @Expose()
  optionLabel: string;

  @Column({ name: 'option_value', length: 255 })
  @Expose()
  optionValue: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  @Expose()
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;
}
