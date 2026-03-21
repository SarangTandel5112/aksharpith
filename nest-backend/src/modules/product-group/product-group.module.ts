import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductGroup } from './entities/product-group.entity';
import { GroupField } from './entities/group-field.entity';
import { GroupFieldOption } from './entities/group-field-option.entity';
import { ProductGroupRepository } from './product-group.repository';
import { ProductGroupService } from './product-group.service';
import { ProductGroupController } from './product-group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductGroup, GroupField, GroupFieldOption])],
  providers: [ProductGroupRepository, ProductGroupService],
  controllers: [ProductGroupController],
  exports: [ProductGroupRepository, ProductGroupService],
})
export class ProductGroupModule {}
