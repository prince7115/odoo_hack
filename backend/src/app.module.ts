import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';

import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { AssetCategoryModule } from './asset-category/asset-category.module';
import { AssetModule } from './asset/asset.module';
import { AuthModule } from './auth/auth.module';
import { AllocationModule } from './allocation/allocation.module';
import { BookingModule } from './booking/booking.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // ── Database ─────────────────────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodbUri'),
        family: 4,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
      }),
      inject: [ConfigService],
    }),

    // ── Feature Modules ───────────────────────────────────────
    EmployeeModule,
    DepartmentModule,
    AssetCategoryModule,
    AssetModule,
    AuthModule,
    AllocationModule,
    BookingModule,
    MaintenanceModule,
    DashboardModule,
    SeedModule,
  ],
})
export class AppModule {}
