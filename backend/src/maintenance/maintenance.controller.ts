import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { MaintenanceService, CreateMaintenanceDto, UpdateMaintenanceDto } from './maintenance.service';
import { ApiResponse } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  async create(@Body() dto: CreateMaintenanceDto, @CurrentUser() user: any) {
    if (!dto.requestedById) dto.requestedById = String(user._id);
    const maint = await this.maintenanceService.create(dto);
    return ApiResponse.success('Maintenance request created successfully', maint);
  }

  @Get()
  async findAll() {
    const maints = await this.maintenanceService.findAll();
    return ApiResponse.success('Maintenance requests fetched successfully', maints);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const maint = await this.maintenanceService.findById(id);
    return ApiResponse.success('Maintenance request fetched successfully', maint);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
    const maint = await this.maintenanceService.update(id, dto);
    return ApiResponse.success('Maintenance request updated successfully', maint);
  }
}
