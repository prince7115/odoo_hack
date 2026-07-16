import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from '../employee/schemas/employee.schema';
import { Department, DepartmentSchema } from '../department/schemas/department.schema';
import { AssetCategory, AssetCategorySchema } from '../asset-category/schemas/asset-category.schema';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: AssetCategory.name, schema: AssetCategorySchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
