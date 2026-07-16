import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { AllocationService, CreateAllocationDto, UpdateAllocationDto } from './allocation.service';
import { ApiResponse } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('allocations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/allocations')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async create(@Body() dto: CreateAllocationDto) {
    const allocation = await this.allocationService.create(dto);
    return ApiResponse.success('Allocation created successfully', allocation);
  }

  @Get()
  async findAll() {
    const allocations = await this.allocationService.findAll();
    return ApiResponse.success('Allocations fetched successfully', allocations);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const allocation = await this.allocationService.findById(id);
    return ApiResponse.success('Allocation fetched successfully', allocation);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateAllocationDto) {
    const allocation = await this.allocationService.update(id, dto);
    return ApiResponse.success('Allocation updated successfully', allocation);
  }
}
