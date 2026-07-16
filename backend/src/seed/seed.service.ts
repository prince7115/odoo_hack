import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Employee } from '../employee/schemas/employee.schema';
import { Department } from '../department/schemas/department.schema';
import { AssetCategory } from '../asset-category/schemas/asset-category.schema';
import { Asset } from '../asset/schemas/asset.schema';
import { Role } from '../common/enums/role.enum';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { AssetCondition } from '../common/enums/asset-condition.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<any>,
    @InjectModel(Department.name) private departmentModel: Model<any>,
    @InjectModel(AssetCategory.name) private categoryModel: Model<any>,
    @InjectModel(Asset.name) private assetModel: Model<any>,
  ) {}

  async onModuleInit() {
    const count = await this.employeeModel.countDocuments();
    if (count > 0) {
      this.logger.log('Database already seeded, skipping.');
      return;
    }

    this.logger.log('Seeding database...');

    // 1. Seed admin employee
    const admin = await this.employeeModel.create({
      email: 'admin@assetflow.com',
      name: 'System Admin',
      role: Role.ADMIN,
      active: true,
    });

    // 2. Seed departments
    const [itDept, hrDept, opsDept] = await this.departmentModel.insertMany([
      { name: 'IT', code: 'IT-01', active: true },
      { name: 'HR', code: 'HR-01', active: true },
      { name: 'Operations', code: 'OPS-01', active: true },
    ]);

    // 3. Seed asset categories
    const [laptops, monitors, keyboards, projectors, software] =
      await this.categoryModel.insertMany([
        { name: 'Laptops' },
        { name: 'Monitors' },
        { name: 'Keyboards' },
        { name: 'Projectors' },
        { name: 'Software' },
      ]);

    // 4. Seed assets
    await this.assetModel.insertMany([
      {
        assetTag: 'TAG-LAP-001',
        name: 'MacBook Pro 16',
        category: laptops._id,
        department: itDept._id,
        status: AssetStatus.AVAILABLE,
        assetCondition: AssetCondition.NEW,
        serialNumber: uuidv4(),
        purchaseDate: new Date(),
        purchaseCost: 2500,
        bookable: true,
      },
      {
        assetTag: 'TAG-MON-001',
        name: 'Dell UltraSharp 27',
        category: monitors._id,
        department: itDept._id,
        status: AssetStatus.AVAILABLE,
        assetCondition: AssetCondition.NEW,
        serialNumber: uuidv4(),
        purchaseDate: new Date(),
        purchaseCost: 500,
        bookable: false,
      },
      {
        assetTag: 'TAG-KEY-001',
        name: 'Logitech MX Keys',
        category: keyboards._id,
        department: hrDept._id,
        status: AssetStatus.AVAILABLE,
        assetCondition: AssetCondition.NEW,
        serialNumber: uuidv4(),
        purchaseDate: new Date(),
        purchaseCost: 100,
        bookable: false,
      },
      {
        assetTag: 'TAG-PRO-001',
        name: 'Epson Home Cinema',
        category: projectors._id,
        department: opsDept._id,
        status: AssetStatus.AVAILABLE,
        assetCondition: AssetCondition.NEW,
        serialNumber: uuidv4(),
        purchaseDate: new Date(),
        purchaseCost: 800,
        bookable: true,
      },
      {
        assetTag: 'TAG-SOF-001',
        name: 'IntelliJ IDEA Ultimate',
        category: software._id,
        department: itDept._id,
        status: AssetStatus.AVAILABLE,
        assetCondition: AssetCondition.NEW,
        serialNumber: uuidv4(),
        purchaseDate: new Date(),
        purchaseCost: 150,
        bookable: false,
      },
    ]);

    this.logger.log(
      `Seeding complete: 1 admin, 3 departments, 5 categories, 5 assets.`,
    );
  }
}
