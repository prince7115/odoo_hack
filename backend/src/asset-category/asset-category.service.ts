import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssetCategory, AssetCategoryDocument } from './schemas/asset-category.schema';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto';

@Injectable()
export class AssetCategoryService {
  constructor(
    @InjectModel(AssetCategory.name) private categoryModel: Model<AssetCategoryDocument>,
  ) {}

  async create(dto: CreateAssetCategoryDto): Promise<AssetCategoryDocument> {
    const existing = await this.categoryModel.findOne({ name: dto.name });
    if (existing) throw new ConflictException(`Category '${dto.name}' already exists`);
    return new this.categoryModel(dto).save();
  }

  async findAll(): Promise<AssetCategoryDocument[]> {
    return this.categoryModel.find().exec();
  }

  async findById(id: string): Promise<AssetCategoryDocument> {
    const cat = await this.categoryModel.findById(id).exec();
    if (!cat) throw new NotFoundException(`AssetCategory with id ${id} not found`);
    return cat;
  }

  async update(id: string, dto: UpdateAssetCategoryDto): Promise<AssetCategoryDocument> {
    const cat = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!cat) throw new NotFoundException(`AssetCategory with id ${id} not found`);
    return cat;
  }

  async count(): Promise<number> {
    return this.categoryModel.countDocuments().exec();
  }
}
