import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateEmployeeDto) {
    const employee = await this.employeeService.create(dto);
    return ApiResponse.success('Employee created successfully', employee);
  }

  @Get()
  async findAll() {
    const employees = await this.employeeService.findAll();
    return ApiResponse.success('Employees fetched successfully', employees);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const employee = await this.employeeService.findById(id);
    return ApiResponse.success('Employee fetched successfully', employee);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    const employee = await this.employeeService.update(id, dto);
    return ApiResponse.success('Employee updated successfully', employee);
  }
}
