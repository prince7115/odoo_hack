import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Maintenance, MaintenanceDocument } from './schemas/maintenance.schema';
import { MaintenanceStatus } from '../common/enums/maintenance-status.enum';
import { MaintenancePriority } from '../common/enums/maintenance-priority.enum';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString() assetId: string;
  @IsString() requestedById: string;
  @IsString() description: string;
  @IsEnum(MaintenancePriority) priority: MaintenancePriority;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateMaintenanceDto {
  @IsOptional() @IsEnum(MaintenanceStatus) status?: MaintenanceStatus;
  @IsOptional() @IsString() approvedById?: string;
  @IsOptional() @IsNumber() cost?: number;
  @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(Maintenance.name) private maintenanceModel: Model<MaintenanceDocument>,
    @InjectModel('Asset') private assetModel: Model<any>,
  ) {}

  private populateAll(q: any) {
    return q
      .populate('asset', 'name assetTag status')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');
  }

  async create(dto: CreateMaintenanceDto): Promise<MaintenanceDocument> {
    const asset = await this.assetModel.findById(dto.assetId);
    if (!asset) throw new NotFoundException(`Asset ${dto.assetId} not found`);

    const maint = await new this.maintenanceModel({
      asset: new Types.ObjectId(dto.assetId),
      requestedBy: new Types.ObjectId(dto.requestedById),
      description: dto.description,
      priority: dto.priority,
      notes: dto.notes,
      status: MaintenanceStatus.PENDING,
    }).save();

    return this.populateAll(this.maintenanceModel.findById(maint._id)).exec();
  }

  async findAll(): Promise<MaintenanceDocument[]> {
    return this.populateAll(this.maintenanceModel.find().sort({ createdAt: -1 })).exec();
  }

  async findById(id: string): Promise<MaintenanceDocument> {
    const maint = await this.populateAll(this.maintenanceModel.findById(id)).exec();
    if (!maint) throw new NotFoundException(`Maintenance request ${id} not found`);
    return maint;
  }

  async update(id: string, dto: UpdateMaintenanceDto): Promise<MaintenanceDocument> {
    const existing = await this.maintenanceModel.findById(id);
    if (!existing) throw new NotFoundException(`Maintenance request ${id} not found`);

    const update: Record<string, unknown> = {};
    if (dto.status) update.status = dto.status;
    if (dto.approvedById) update.approvedBy = new Types.ObjectId(dto.approvedById);
    if (dto.cost !== undefined) update.cost = dto.cost;
    if (dto.notes) update.notes = dto.notes;

    // Manage asset status transitions
    if (dto.status === MaintenanceStatus.APPROVED || dto.status === MaintenanceStatus.IN_PROGRESS) {
      await this.assetModel.findByIdAndUpdate(existing.asset, { status: AssetStatus.UNDER_MAINTENANCE });
    } else if (dto.status === MaintenanceStatus.COMPLETED || dto.status === MaintenanceStatus.REJECTED) {
      await this.assetModel.findByIdAndUpdate(existing.asset, { status: AssetStatus.AVAILABLE });
      if (dto.status === MaintenanceStatus.COMPLETED) update.completedAt = new Date();
    }

    const updated = await this.populateAll(
      this.maintenanceModel.findByIdAndUpdate(id, update, { new: true }),
    ).exec();
    return updated!;
  }
}
