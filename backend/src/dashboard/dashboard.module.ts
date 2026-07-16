import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';
import { Booking, BookingSchema } from '../booking/schemas/booking.schema';
import { Employee, EmployeeSchema } from '../employee/schemas/employee.schema';
import { Department, DepartmentSchema } from '../department/schemas/department.schema';
import { AssetCategory, AssetCategorySchema } from '../asset-category/schemas/asset-category.schema';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: AssetCategory.name, schema: AssetCategorySchema },
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
