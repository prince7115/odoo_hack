import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BookingStatus } from '../../common/enums/booking-status.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  asset: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  bookedBy: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ required: true })
  purpose: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
