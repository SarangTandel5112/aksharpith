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
import { CreateMarketingMediaDto } from './dto/create-marketing-media.dto';
import { CreateProductZoneDto } from './dto/create-product-zone.dto';
import { UpsertGroupFieldValueDto } from './dto/upsert-group-field-value.dto';
import { CreateProductVendorDto } from './dto/create-product-vendor.dto';

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

  // Marketing media sub-resource
  @Get(':id/marketing-media')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  getMarketingMedia(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getMarketingMedia(id);
  }

  @Post(':id/marketing-media')
  @Roles([ROLE.ADMIN])
  addMarketingMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMarketingMediaDto,
  ) {
    return this.service.addMarketingMedia(id, dto);
  }

  @Delete(':id/marketing-media/:mediaId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMarketingMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.service.removeMarketingMedia(id, mediaId);
  }

  // Zone sub-resource
  @Get(':id/zones')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  getZones(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getZones(id);
  }

  @Post(':id/zones')
  @Roles([ROLE.ADMIN])
  addZone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductZoneDto,
  ) {
    return this.service.addZone(id, dto);
  }

  @Patch(':id/zones/:zoneId')
  @Roles([ROLE.ADMIN])
  updateZone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('zoneId', ParseUUIDPipe) zoneId: string,
    @Body() dto: CreateProductZoneDto,
  ) {
    return this.service.updateZone(id, zoneId, dto);
  }

  @Delete(':id/zones/:zoneId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  removeZone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('zoneId', ParseUUIDPipe) zoneId: string,
  ) {
    return this.service.removeZone(id, zoneId);
  }

  // Group field values sub-resource
  @Get(':id/group-field-values')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  getGroupFieldValues(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getGroupFieldValues(id);
  }

  @Put(':id/group-field-values')
  @Roles([ROLE.ADMIN])
  upsertGroupFieldValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertGroupFieldValueDto,
  ) {
    return this.service.upsertGroupFieldValue(id, dto);
  }

  @Delete(':id/group-field-values/:fieldId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  removeGroupFieldValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
  ) {
    return this.service.removeGroupFieldValue(id, fieldId);
  }

  // Vendor sub-resource
  @Get(':id/vendors')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  getVendors(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getVendors(id);
  }

  @Post(':id/vendors')
  @Roles([ROLE.ADMIN])
  addVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductVendorDto,
  ) {
    return this.service.addVendor(id, dto);
  }

  @Patch(':id/vendors/:vendorId')
  @Roles([ROLE.ADMIN])
  updateVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Body() dto: CreateProductVendorDto,
  ) {
    return this.service.updateVendor(id, vendorId, dto);
  }

  @Delete(':id/vendors/:vendorId')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVendor(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ) {
    return this.service.removeVendor(id, vendorId);
  }
}
