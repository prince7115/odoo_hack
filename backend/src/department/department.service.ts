import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<DepartmentDocument> {
    const existing = await this.departmentModel.findOne({
      $or: [{ name: dto.name }, { code: dto.code }],
    });
    if (existing) {
      throw new ConflictException('Department with same name or code already exists');
    }
    const dept = new this.departmentModel({
      ...dto,
      parentDepartment: dto.parentDepartmentId
        ? new Types.ObjectId(dto.parentDepartmentId)
        : null,
      head: dto.headId ? new Types.ObjectId(dto.headId) : null,
    });
    return dept.save();
  }

  async findAll(): Promise<DepartmentDocument[]> {
    return this.departmentModel
      .find()
      .populate('parentDepartment', 'name code')
      .populate('head', 'name email')
      .exec();
  }

  async findById(id: string): Promise<DepartmentDocument> {
    const dept = await this.departmentModel
      .findById(id)
      .populate('parentDepartment', 'name code')
      .populate('head', 'name email')
      .exec();
    if (!dept) throw new NotFoundException(`Department with id ${id} not found`);
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentDocument> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.parentDepartmentId !== undefined) {
      update.parentDepartment = dto.parentDepartmentId
        ? new Types.ObjectId(dto.parentDepartmentId)
        : null;
      delete update.parentDepartmentId;
    }
    if (dto.headId !== undefined) {
      update.head = dto.headId ? new Types.ObjectId(dto.headId) : null;
      delete update.headId;
    }
    const dept = await this.departmentModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('parentDepartment', 'name code')
      .populate('head', 'name email')
      .exec();
    if (!dept) throw new NotFoundException(`Department with id ${id} not found`);
    return dept;
  }

  async count(): Promise<number> {
    return this.departmentModel.countDocuments().exec();
  }
}
