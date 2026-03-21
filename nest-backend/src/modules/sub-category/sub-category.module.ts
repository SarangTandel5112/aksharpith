import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { SubCategoryRepository } from './sub-category.repository';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryController } from './sub-category.controller';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory]), CategoryModule],
  providers: [SubCategoryRepository, SubCategoryService],
  controllers: [SubCategoryController],
  exports: [SubCategoryRepository, SubCategoryService],
})
export class SubCategoryModule {}
