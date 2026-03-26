import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { User } from '../../user/entities/user.entity';

@Entity('user_roles')
@Index(['roleName'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ name: 'role_name', length: 100 })
  @Expose()
  roleName: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Expose()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  @Expose()
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => User, (user) => user.role)
  users?: User[];
}
