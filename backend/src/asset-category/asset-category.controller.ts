import {
  Controller, Get, Post, Put, Body, Param, UseGuards,
} from '@nestjs/common';
import { AssetCategoryService } from './asset-category.service';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/categories')
export class AssetCategoryController {
  constructor(private readonly categoryService: AssetCategoryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async create(@Body() dto: CreateAssetCategoryDto) {
    const cat = await this.categoryService.create(dto);
    return ApiResponse.success('Category created successfully', cat);
  }

  @Get()
  async findAll() {
    const cats = await this.categoryService.findAll();
    return ApiResponse.success('Categories fetched successfully', cats);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cat = await this.categoryService.findById(id);
    return ApiResponse.success('Category fetched successfully', cat);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateAssetCategoryDto) {
    const cat = await this.categoryService.update(id, dto);
    return ApiResponse.success('Category updated successfully', cat);
  }
}
