import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductPhysicalAttributes } from './entities/product-physical-attributes.entity';
import { ProductMarketingMedia } from './entities/product-marketing-media.entity';
import { ProductZone } from './entities/product-zone.entity';
import { ProductVendor } from './entities/product-vendor.entity';
import { ProductGroupFieldValue } from './entities/product-group-field-value.entity';
import { GroupField } from '../product-group/entities/group-field.entity';
import { GroupFieldOption } from '../product-group/entities/group-field-option.entity';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductMedia,
      ProductPhysicalAttributes,
      ProductMarketingMedia,
      ProductZone,
      ProductVendor,
      ProductGroupFieldValue,
      GroupField,
      GroupFieldOption,
    ]),
  ],
  providers: [ProductRepository, ProductService],
  controllers: [ProductController],
  exports: [ProductRepository, ProductService],
})
export class ProductModule {}
