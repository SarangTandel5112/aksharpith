import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { User } from '../entities/user.entity';

export class UserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique user ID (UUID)',
  })
  @IsUUID()
  readonly id: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiPropertyOptional({ example: 'Robert', description: 'Middle name (optional)' })
  @IsOptional()
  @IsString()
  readonly middleName: string | null;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  readonly email: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Role ID (UUID)',
  })
  @IsOptional()
  @IsUUID()
  readonly roleId: string | null;

  @ApiProperty({ example: true, description: 'Whether the user is active' })
  @IsBoolean()
  readonly isActive: boolean;

  @ApiProperty({
    example: '2025-03-04T12:00:00Z',
    description: 'User creation timestamp',
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: '2025-03-05T12:00:00Z',
    description: 'User last update timestamp',
  })
  readonly updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.middleName = user.middleName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.roleId = user.roleId ?? null;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
