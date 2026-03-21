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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { ROLE } from '../../utils/constants';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { QuerySubCategoryDto } from './dto/query-sub-category.dto';

@ApiTags('sub-categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sub-categories')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  @ApiOperation({ summary: 'List sub-categories' })
  findAll(@Query() query: QuerySubCategoryDto) {
    return this.subCategoryService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles([ROLE.ADMIN, ROLE.STAFF, ROLE.VIEWER])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subCategoryService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles([ROLE.ADMIN])
  create(@Body() dto: CreateSubCategoryDto) {
    return this.subCategoryService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles([ROLE.ADMIN])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubCategoryDto,
  ) {
    return this.subCategoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles([ROLE.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.subCategoryService.remove(id);
  }
}
