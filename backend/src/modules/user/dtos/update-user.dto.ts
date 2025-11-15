import {
  IsEmail,
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  Firstname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Middle name must not exceed 100 characters' })
  Middlename?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  Lastname?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password?: string;

  @IsOptional()
  @IsNumber()
  roleId?: number;
}
