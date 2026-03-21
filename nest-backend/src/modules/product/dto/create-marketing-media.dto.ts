import { IsString, IsEnum, IsInt, IsOptional, Min, IsUrl } from 'class-validator';
import { MarketingMediaType } from '../entities/product-marketing-media.entity';

export class CreateMarketingMediaDto {
  @IsUrl()
  mediaUrl: string;

  @IsEnum(MarketingMediaType)
  @IsOptional()
  mediaType?: MarketingMediaType;

  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  fileSize?: number;
}
