import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description:
      'When changing groupId, pass true to delete existing field values',
  })
  @IsOptional()
  @IsBoolean()
  clearFieldValues?: boolean;
}
