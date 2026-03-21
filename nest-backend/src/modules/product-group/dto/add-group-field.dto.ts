import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldType } from '../entities/group-field.entity';

export class AddGroupFieldDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(150) fieldName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) fieldKey?: string;
  @ApiPropertyOptional({ enum: FieldType }) @IsOptional() @IsEnum(FieldType) fieldType?: FieldType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFilterable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
