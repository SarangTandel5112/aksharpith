import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductPhysicalAttributes } from './entities/product-physical-attributes.entity';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductMedia, ProductPhysicalAttributes]),
  ],
  providers: [ProductRepository, ProductService],
  controllers: [ProductController],
  exports: [ProductRepository, ProductService],
})
export class ProductModule {}
