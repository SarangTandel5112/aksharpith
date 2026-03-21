import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ROLE } from '../../utils/constants';
import { ProductGroupService } from './product-group.service';
import { CreateProductGroupDto } from './dto/create-product-group.dto';
import { UpdateProductGroupDto } from './dto/update-product-group.dto';
import { QueryProductGroupDto } from './dto/query-product-group.dto';

@ApiTags('product-groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product-groups')
export class ProductGroupController {
  constructor(private readonly service: ProductGroupService) {}

  @Get()
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findAll(@Query() query: QueryProductGroupDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/fields')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findWithFields(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findWithFields(id);
  }

  @Post()
  @Roles([ROLE.ADMIN])
  create(@Body() dto: CreateProductGroupDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles([ROLE.ADMIN])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
