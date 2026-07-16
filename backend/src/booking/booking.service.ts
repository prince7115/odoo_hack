import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString() assetId: string;
  @IsString() bookedById: string;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
  @IsString() purpose: string;
}

export class UpdateBookingDto {
  @IsOptional() @IsEnum(BookingStatus) status?: BookingStatus;
  @IsOptional() @IsDateString() startTime?: string;
  @IsOptional() @IsDateString() endTime?: string;
  @IsOptional() @IsString() purpose?: string;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel('Asset') private assetModel: Model<any>,
  ) {}

  private populateAll(q: any) {
    return q
      .populate('asset', 'name assetTag bookable')
      .populate('bookedBy', 'name email');
  }

  async create(dto: CreateBookingDto): Promise<BookingDocument> {
    const asset = await this.assetModel.findById(dto.assetId);
    if (!asset) throw new NotFoundException(`Asset ${dto.assetId} not found`);
    if (!asset.bookable) throw new BadRequestException('Asset is not bookable');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (start >= end) throw new BadRequestException('startTime must be before endTime');

    // Check for overlapping approved/pending bookings
    const overlap = await this.bookingModel.findOne({
      asset: new Types.ObjectId(dto.assetId),
      status: { $in: [BookingStatus.APPROVED, BookingStatus.PENDING] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });
    if (overlap) throw new BadRequestException('Asset already has an overlapping booking in that time slot');

    const booking = await new this.bookingModel({
      asset: new Types.ObjectId(dto.assetId),
      bookedBy: new Types.ObjectId(dto.bookedById),
      startTime: start,
      endTime: end,
      purpose: dto.purpose,
      status: BookingStatus.PENDING,
    }).save();

    return this.populateAll(this.bookingModel.findById(booking._id)).exec();
  }

  async findAll(): Promise<BookingDocument[]> {
    return this.populateAll(this.bookingModel.find().sort({ startTime: -1 })).exec();
  }

  async findById(id: string): Promise<BookingDocument> {
    const booking = await this.populateAll(this.bookingModel.findById(id)).exec();
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async update(id: string, dto: UpdateBookingDto): Promise<BookingDocument> {
    const update: Record<string, unknown> = {};
    if (dto.status) update.status = dto.status;
    if (dto.startTime) update.startTime = new Date(dto.startTime);
    if (dto.endTime) update.endTime = new Date(dto.endTime);
    if (dto.purpose) update.purpose = dto.purpose;

    const updated = await this.populateAll(
      this.bookingModel.findByIdAndUpdate(id, update, { new: true }),
    ).exec();
    if (!updated) throw new NotFoundException(`Booking ${id} not found`);
    return updated;
  }

  async countByStatus(...statuses: BookingStatus[]): Promise<number> {
    return this.bookingModel.countDocuments({ status: { $in: statuses } }).exec();
  }
}
