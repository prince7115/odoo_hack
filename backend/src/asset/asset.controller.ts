import {
  Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, UpdateAssetDto, AssetSearchDto } from './dto/asset.dto';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { ApiResponse } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async create(@Body() dto: CreateAssetDto) {
    const asset = await this.assetService.create(dto);
    return ApiResponse.success('Asset created successfully', asset);
  }

  @Get()
  async findAll() {
    const assets = await this.assetService.findAll();
    return ApiResponse.success('Assets fetched successfully', assets);
  }

  @Get('search')
  async search(@Query() criteria: AssetSearchDto) {
    const result = await this.assetService.search(criteria);
    return ApiResponse.success('Assets searched successfully', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const asset = await this.assetService.findById(id);
    return ApiResponse.success('Asset fetched successfully', asset);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    const asset = await this.assetService.update(id, dto);
    return ApiResponse.success('Asset updated successfully', asset);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: AssetStatus,
  ) {
    const asset = await this.assetService.updateStatus(id, status);
    return ApiResponse.success('Asset status updated successfully', asset);
  }
}
