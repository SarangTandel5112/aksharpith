import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateProductZoneDto {
  @IsString() @MaxLength(100) zoneName: string;
  @IsString() @MaxLength(10) @IsOptional() zoneCode?: string;
  @IsString() @IsOptional() description?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
