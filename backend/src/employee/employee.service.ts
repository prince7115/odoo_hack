import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeDocument> {
    const employee = new this.employeeModel({
      ...dto,
      department: dto.departmentId ? new Types.ObjectId(dto.departmentId) : null,
    });
    return employee.save();
  }

  async findAll(): Promise<EmployeeDocument[]> {
    return this.employeeModel.find().populate('department').exec();
  }

  async findById(id: string): Promise<EmployeeDocument> {
    const employee = await this.employeeModel.findById(id).populate('department').exec();
    if (!employee) throw new NotFoundException(`Employee with id ${id} not found`);
    return employee;
  }

  async findByEmail(email: string): Promise<EmployeeDocument | null> {
    return this.employeeModel.findOne({ email: email.toLowerCase() }).populate('department').exec();
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeDocument> {
    const update: Partial<EmployeeDocument> & Record<string, unknown> = { ...dto };
    if (dto.departmentId) {
      update.department = new Types.ObjectId(dto.departmentId);
      delete update.departmentId;
    }
    const employee = await this.employeeModel
      .findByIdAndUpdate(id, update, { new: true })
      .populate('department')
      .exec();
    if (!employee) throw new NotFoundException(`Employee with id ${id} not found`);
    return employee;
  }

  async count(): Promise<number> {
    return this.employeeModel.countDocuments().exec();
  }
}
