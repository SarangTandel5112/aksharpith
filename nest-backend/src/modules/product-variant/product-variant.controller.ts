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
import { ProductVariantService } from './product-variant.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { QueryProductVariantDto } from './dto/query-product-variant.dto';
import { GenerateLotMatrixDto } from './dto/generate-lot-matrix.dto';

@ApiTags('product-variants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products/:productId/variants')
export class ProductVariantController {
  constructor(private readonly service: ProductVariantService) {}

  @Get()
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findAll(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: QueryProductVariantDto,
  ) {
    return this.service.findAll(productId, query);
  }

  @Get(':id')
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findOne(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(productId, id);
  }

  @Post('generate-matrix')
  @Roles([ROLE.ADMIN])
  generateMatrix(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: GenerateLotMatrixDto,
  ) {
    return this.service.generateMatrix(productId, dto);
  }

  @Post()
  @Roles([ROLE.ADMIN])
  create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.service.create(productId, dto);
  }

  @Patch(':id')
  @Roles([ROLE.ADMIN])
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.service.update(productId, id, dto);
  }

  @Delete(':id')
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(productId, id);
  }
}
