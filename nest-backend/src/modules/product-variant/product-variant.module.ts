import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantAttribute } from './entities/product-variant-attribute.entity';
import { ProductVariantMedia } from './entities/product-variant-media.entity';
import { Product } from '../product/entities/product.entity';
import { ProductAttributeValue } from '../product-attribute/entities/product-attribute-value.entity';
import { ProductVariantRepository } from './product-variant.repository';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariant,
      ProductVariantAttribute,
      ProductVariantMedia,
      Product,
      ProductAttributeValue,
    ]),
  ],
  providers: [ProductVariantRepository, ProductVariantService],
  controllers: [ProductVariantController],
  exports: [ProductVariantRepository, ProductVariantService],
})
export class ProductVariantModule {}
