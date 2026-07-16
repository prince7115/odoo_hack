import {
  Controller, Get, Post, Put, Body, Param, UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async create(@Body() dto: CreateDepartmentDto) {
    const dept = await this.departmentService.create(dto);
    return ApiResponse.success('Department created successfully', dept);
  }

  @Get()
  async findAll() {
    const depts = await this.departmentService.findAll();
    return ApiResponse.success('Departments fetched successfully', depts);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dept = await this.departmentService.findById(id);
    return ApiResponse.success('Department fetched successfully', dept);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    const dept = await this.departmentService.update(id, dto);
    return ApiResponse.success('Department updated successfully', dept);
  }
}
