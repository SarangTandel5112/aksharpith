import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../role/entities/role.entity';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';

@Entity('users')
@Index(['username'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
@Index(['email'], {
  unique: true,
  where: '"deleted_at" IS NULL AND "is_active" = true',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ length: 255 })
  @Expose()
  username: string;

  @Column({ length: 100 })
  @Expose()
  firstName: string;

  @Column({ length: 100, nullable: true })
  @Expose()
  middleName: string | null;

  @Column({ length: 100 })
  @Expose()
  lastName: string;

  @Column({ name: 'email', length: 255 })
  @Expose()
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'is_temp_password', type: 'boolean', default: true })
  @Expose()
  isTempPassword: boolean;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role: Role;

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

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];
}
