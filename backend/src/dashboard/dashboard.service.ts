import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset } from '../asset/schemas/asset.schema';
import { Booking } from '../booking/schemas/booking.schema';
import { Employee } from '../employee/schemas/employee.schema';
import { Department } from '../department/schemas/department.schema';
import { AssetCategory } from '../asset-category/schemas/asset-category.schema';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { BookingStatus } from '../common/enums/booking-status.enum';

export interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  underMaintenanceAssets: number;
  disposedAssets: number;
  activeBookings: number;
  pendingBookings: number;
  totalEmployees: number;
  totalDepartments: number;
  totalCategories: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<any>,
    @InjectModel(Booking.name) private bookingModel: Model<any>,
    @InjectModel(Employee.name) private employeeModel: Model<any>,
    @InjectModel(Department.name) private departmentModel: Model<any>,
    @InjectModel(AssetCategory.name) private categoryModel: Model<any>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenanceAssets,
      disposedAssets,
      activeBookings,
      pendingBookings,
      totalEmployees,
      totalDepartments,
      totalCategories,
    ] = await Promise.all([
      this.assetModel.countDocuments(),
      this.assetModel.countDocuments({ status: AssetStatus.AVAILABLE }),
      this.assetModel.countDocuments({ status: AssetStatus.ALLOCATED }),
      this.assetModel.countDocuments({ status: AssetStatus.UNDER_MAINTENANCE }),
      this.assetModel.countDocuments({ status: AssetStatus.DISPOSED }),
      this.bookingModel.countDocuments({ status: BookingStatus.APPROVED }),
      this.bookingModel.countDocuments({ status: BookingStatus.PENDING }),
      this.employeeModel.countDocuments(),
      this.departmentModel.countDocuments(),
      this.categoryModel.countDocuments(),
    ]);

    return {
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenanceAssets,
      disposedAssets,
      activeBookings,
      pendingBookings,
      totalEmployees,
      totalDepartments,
      totalCategories,
    };
  }
}
