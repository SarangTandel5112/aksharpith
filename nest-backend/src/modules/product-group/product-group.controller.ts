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
import { AddGroupFieldDto } from './dto/add-group-field.dto';
import { UpdateGroupFieldDto } from './dto/update-group-field.dto';
import { CreateGroupFieldOptionDto } from './dto/create-group-field-option.dto';
import { UpdateGroupFieldOptionDto } from './dto/update-group-field-option.dto';

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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductGroupDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post(':id/fields')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  addField(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddGroupFieldDto,
  ) {
    return this.service.addField(id, dto);
  }

  @Patch(':id/fields/:fieldId')
  @Roles([ROLE.ADMIN])
  updateField(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Body() dto: UpdateGroupFieldDto,
  ) {
    return this.service.updateField(id, fieldId, dto);
  }

  @Delete(':id/fields/:fieldId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  removeField(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
  ) {
    return this.service.removeField(id, fieldId);
  }

  @Post(':id/fields/:fieldId/options')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  addOption(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Body() dto: CreateGroupFieldOptionDto,
  ) {
    return this.service.addOption(id, fieldId, dto);
  }

  @Patch(':id/fields/:fieldId/options/:optId')
  @Roles([ROLE.ADMIN])
  updateOption(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Param('optId', ParseUUIDPipe) optId: string,
    @Body() dto: UpdateGroupFieldOptionDto,
  ) {
    return this.service.updateOption(id, fieldId, optId, dto);
  }

  @Delete(':id/fields/:fieldId/options/:optId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  removeOption(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Param('optId', ParseUUIDPipe) optId: string,
  ) {
    return this.service.removeOption(id, fieldId, optId);
  }
}
