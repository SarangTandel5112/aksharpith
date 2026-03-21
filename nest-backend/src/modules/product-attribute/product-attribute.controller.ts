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
import { ProductAttributeService } from './product-attribute.service';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { QueryProductAttributeDto } from './dto/query-product-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';

@ApiTags('product-attributes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product-attributes')
export class ProductAttributeController {
  constructor(private readonly service: ProductAttributeService) {}

  @Get()
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findAll(@Query() query: QueryProductAttributeDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/values')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findWithValues(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findWithValues(id);
  }

  @Post()
  @Roles([ROLE.ADMIN])
  create(@Body() dto: CreateProductAttributeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles([ROLE.ADMIN])
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductAttributeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/values')
  @Roles([ROLE.ADMIN])
  addValue(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateAttributeValueDto) {
    return this.service.addValue(id, dto);
  }

  @Patch(':id/values/:valueId')
  @Roles([ROLE.ADMIN])
  updateValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    return this.service.updateValue(id, valueId, dto);
  }

  @Delete(':id/values/:valueId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  removeValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
  ) {
    return this.service.removeValue(id, valueId);
  }
}
