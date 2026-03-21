import { IsUUID, IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpsertGroupFieldValueDto {
  @IsUUID() fieldId: string;
  @IsString() @IsOptional() valueText?: string;
  @IsNumber() @IsOptional() valueNumber?: number;
  @IsBoolean() @IsOptional() valueBoolean?: boolean;
  @IsUUID() @IsOptional() valueOptionId?: string;
}
