import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldValueItemDto {
  @ApiProperty() @IsUUID('4') fieldId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() valueText?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valueNumber?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() valueBoolean?:
    | boolean
    | null;
  @ApiPropertyOptional() @IsOptional() @IsUUID('4') valueOptionId?:
    | string
    | null;
}

export class BulkUpsertGroupFieldValuesDto {
  @ApiProperty({ type: [FieldValueItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueItemDto)
  values: FieldValueItemDto[];
}
