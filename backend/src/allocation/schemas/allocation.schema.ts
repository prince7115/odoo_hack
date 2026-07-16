import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AllocationStatus } from '../../common/enums/allocation-status.enum';

export type AllocationDocument = HydratedDocument<Allocation>;

@Schema({ timestamps: true })
export class Allocation {
  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  asset: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  allocatedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  allocatedToDept: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  allocatedBy: Types.ObjectId;

  @Prop({ required: true })
  allocationDate: Date;

  @Prop()
  returnDate: Date;

  @Prop({ required: true, enum: AllocationStatus, default: AllocationStatus.ACTIVE })
  status: AllocationStatus;

  @Prop()
  notes: string;
}

export const AllocationSchema = SchemaFactory.createForClass(Allocation);
