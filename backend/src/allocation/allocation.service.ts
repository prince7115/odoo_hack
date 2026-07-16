import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Allocation, AllocationDocument } from './schemas/allocation.schema';
import { AllocationStatus } from '../common/enums/allocation-status.enum';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAllocationDto {
  @IsString() assetId: string;
  @IsOptional() @IsString() allocatedToEmployeeId?: string;
  @IsOptional() @IsString() allocatedToDeptId?: string;
  @IsString() allocatedById: string;
  @IsDateString() allocationDate: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateAllocationDto {
  @IsOptional() @IsEnum(AllocationStatus) status?: AllocationStatus;
  @IsOptional() @IsDateString() returnDate?: string;
  @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class AllocationService {
  constructor(
    @InjectModel(Allocation.name) private allocationModel: Model<AllocationDocument>,
    @InjectModel('Asset') private assetModel: Model<any>,
  ) {}

  private populateAll(q: any) {
    return q
      .populate('asset', 'name assetTag status')
      .populate('allocatedTo', 'name email')
      .populate('allocatedToDept', 'name code')
      .populate('allocatedBy', 'name email');
  }

  async create(dto: CreateAllocationDto): Promise<AllocationDocument> {
    const asset = await this.assetModel.findById(dto.assetId);
    if (!asset) throw new NotFoundException(`Asset ${dto.assetId} not found`);
    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new BadRequestException(`Asset is not available (current status: ${asset.status})`);
    }

    const allocation = await new this.allocationModel({
      asset: new Types.ObjectId(dto.assetId),
      allocatedTo: dto.allocatedToEmployeeId ? new Types.ObjectId(dto.allocatedToEmployeeId) : null,
      allocatedToDept: dto.allocatedToDeptId ? new Types.ObjectId(dto.allocatedToDeptId) : null,
      allocatedBy: new Types.ObjectId(dto.allocatedById),
      allocationDate: new Date(dto.allocationDate),
      notes: dto.notes,
      status: AllocationStatus.ACTIVE,
    }).save();

    // Update asset status to ALLOCATED
    await this.assetModel.findByIdAndUpdate(dto.assetId, { status: AssetStatus.ALLOCATED });

    return this.populateAll(this.allocationModel.findById(allocation._id)).exec();
  }

  async findAll(): Promise<AllocationDocument[]> {
    return this.populateAll(this.allocationModel.find()).exec();
  }

  async findById(id: string): Promise<AllocationDocument> {
    const allocation = await this.populateAll(this.allocationModel.findById(id)).exec();
    if (!allocation) throw new NotFoundException(`Allocation ${id} not found`);
    return allocation;
  }

  async update(id: string, dto: UpdateAllocationDto): Promise<AllocationDocument> {
    const allocation = await this.allocationModel.findById(id);
    if (!allocation) throw new NotFoundException(`Allocation ${id} not found`);

    const update: Record<string, unknown> = {};
    if (dto.status) update.status = dto.status;
    if (dto.returnDate) update.returnDate = new Date(dto.returnDate);
    if (dto.notes) update.notes = dto.notes;

    // If returning asset, update asset status back to AVAILABLE
    if (dto.status === AllocationStatus.RETURNED) {
      await this.assetModel.findByIdAndUpdate(allocation.asset, { status: AssetStatus.AVAILABLE });
    }

    const updated = await this.populateAll(
      this.allocationModel.findByIdAndUpdate(id, update, { new: true }),
    ).exec();
    return updated!;
  }
}
