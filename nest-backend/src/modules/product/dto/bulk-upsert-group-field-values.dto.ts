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
import { ApiProperty } from '@nestjs/swagger';

export class FieldValueItemDto {
  @IsUUID('4') fieldId: string;
  @IsOptional() @IsString() valueText?: string | null;
  @IsOptional() @IsNumber() valueNumber?: number | null;
  @IsOptional() @IsBoolean() valueBoolean?: boolean | null;
  @IsOptional() @IsUUID('4') valueOptionId?: string | null;
}

export class BulkUpsertGroupFieldValuesDto {
  @ApiProperty({ type: [FieldValueItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueItemDto)
  values: FieldValueItemDto[];
}
