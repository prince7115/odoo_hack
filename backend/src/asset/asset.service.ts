import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { CreateAssetDto, UpdateAssetDto, AssetSearchDto } from './dto/asset.dto';
import { AssetStatus } from '../common/enums/asset-status.enum';
import { PagedResponse } from '../common/dto/paged-response.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
  ) {}

  private populate(query: ReturnType<typeof this.assetModel.findById | typeof this.assetModel.findOne>) {
    return query
      .populate('category', 'name description')
      .populate('department', 'name code');
  }

  async create(dto: CreateAssetDto): Promise<AssetDocument> {
    if (dto.serialNumber) {
      const exists = await this.assetModel.exists({ serialNumber: dto.serialNumber });
      if (exists) throw new ConflictException(`Asset with serial number ${dto.serialNumber} already exists`);
    }

    const assetTag = `AST-${uuidv4().substring(0, 8).toUpperCase()}`;
    const asset = new this.assetModel({
      ...dto,
      assetTag,
      status: AssetStatus.AVAILABLE,
      category: new Types.ObjectId(dto.categoryId),
      department: dto.departmentId ? new Types.ObjectId(dto.departmentId) : null,
    });
    const saved = await asset.save();
    return (await this.assetModel.findById(saved._id)
      .populate('category', 'name description')
      .populate('department', 'name code')
      .exec())!;
  }

  async update(id: string, dto: UpdateAssetDto): Promise<AssetDocument> {
    const asset = await this.assetModel.findById(id).exec();
    if (!asset) throw new NotFoundException(`Asset with id ${id} not found`);

    if (dto.serialNumber && dto.serialNumber !== asset.serialNumber) {
      const exists = await this.assetModel.exists({ serialNumber: dto.serialNumber, _id: { $ne: id } });
      if (exists) throw new ConflictException(`Asset with serial number ${dto.serialNumber} already exists`);
    }

    const update: Record<string, unknown> = { ...dto };
    if (dto.categoryId) { update.category = new Types.ObjectId(dto.categoryId); delete update.categoryId; }
    if (dto.departmentId !== undefined) {
      update.department = dto.departmentId ? new Types.ObjectId(dto.departmentId) : null;
      delete update.departmentId;
    }

    const updated = await this.assetModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('category', 'name description')
      .populate('department', 'name code')
      .exec();
    if (!updated) throw new NotFoundException(`Asset with id ${id} not found`);
    return updated;
  }

  async findById(id: string): Promise<AssetDocument> {
    const asset = await this.assetModel.findById(id)
      .populate('category', 'name description')
      .populate('department', 'name code')
      .exec();
    if (!asset) throw new NotFoundException(`Asset with id ${id} not found`);
    return asset;
  }

  async findAll(): Promise<AssetDocument[]> {
    return this.assetModel.find()
      .populate('category', 'name description')
      .populate('department', 'name code')
      .exec();
  }

  async updateStatus(id: string, status: AssetStatus): Promise<AssetDocument> {
    const asset = await this.assetModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('category', 'name description')
      .populate('department', 'name code')
      .exec();
    if (!asset) throw new NotFoundException(`Asset with id ${id} not found`);
    return asset;
  }

  async search(criteria: AssetSearchDto): Promise<PagedResponse<AssetDocument>> {
    const page = parseInt(criteria.page ?? '0', 10);
    const size = parseInt(criteria.size ?? '10', 10);
    const filter: Record<string, unknown> = {};

    if (criteria.search) {
      const pattern = new RegExp(criteria.search, 'i');
      filter.$or = [
        { name: pattern },
        { assetTag: pattern },
        { serialNumber: pattern },
      ];
    }
    if (criteria.categoryId) filter.category = new Types.ObjectId(criteria.categoryId);
    if (criteria.departmentId) filter.department = new Types.ObjectId(criteria.departmentId);
    if (criteria.status) filter.status = criteria.status;
    if (criteria.bookable !== undefined) filter.bookable = criteria.bookable === 'true';

    const [totalElements, content] = await Promise.all([
      this.assetModel.countDocuments(filter).exec(),
      this.assetModel.find(filter)
        .skip(page * size)
        .limit(size)
        .populate('category', 'name description')
        .populate('department', 'name code')
        .exec(),
    ]);

    const totalPages = Math.ceil(totalElements / size);
    return new PagedResponse(content, page, size, totalElements, totalPages, page >= totalPages - 1);
  }

  async countByStatus(status: AssetStatus): Promise<number> {
    return this.assetModel.countDocuments({ status }).exec();
  }

  async count(): Promise<number> {
    return this.assetModel.countDocuments().exec();
  }
}
