import { IsString, MaxLength, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGroupFieldDto {
  // NOTE: fieldKey and fieldType are intentionally excluded — immutable after creation
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) fieldName?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFilterable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
