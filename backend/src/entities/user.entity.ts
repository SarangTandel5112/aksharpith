import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  username!: string;

  @Column({ type: 'varchar' })
  Firstname!: string;

  @Column({ type: 'varchar', nullable: true })
  Middlename!: string | null;

  @Column({ type: 'varchar' })
  Lastname!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash!: string;

  @Column({ name: 'is_temp_password', type: 'boolean', default: true })
  isTempPassword!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'role_id', type: 'int' })
  roleId!: number;

  @ManyToOne('UserRole', 'users')
  @JoinColumn({ name: 'role_id' })
  role!: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date | null;

  @OneToMany('PasswordResetToken', 'user')
  passwordResetTokens!: any[];
}
