import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CreateProductMediaDto } from './dto/create-product-media.dto';
import { UpsertPhysicalAttributesDto } from './dto/upsert-physical-attributes.dto';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findAll(@Query() query: QueryProductDto) {
    return this.service.findAll(query);
  }

  @Get('stats/count')
  @Roles([ROLE.ADMIN, ROLE.STAFF])
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles([ROLE.ADMIN])
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles([ROLE.ADMIN])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  // Media sub-resource
  @Post(':id/media')
  @Roles([ROLE.ADMIN])
  addMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductMediaDto,
  ) {
    return this.service.addMedia(id, dto);
  }

  @Get(':id/media')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  getMedia(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getMedia(id);
  }

  @Delete(':id/media/:mediaId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.service.deleteMedia(id, mediaId);
  }

  // Physical attributes sub-resource
  @Put(':id/physical-attributes')
  @Roles([ROLE.ADMIN])
  upsertPhysicalAttributes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertPhysicalAttributesDto,
  ) {
    return this.service.upsertPhysicalAttributes(id, dto);
  }

  @Get(':id/physical-attributes')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  getPhysicalAttributes(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getPhysicalAttributes(id);
  }
}
