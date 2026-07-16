import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MaintenanceStatus } from '../../common/enums/maintenance-status.enum';
import { MaintenancePriority } from '../../common/enums/maintenance-priority.enum';

export type MaintenanceDocument = HydratedDocument<Maintenance>;

@Schema({ timestamps: true })
export class Maintenance {
  @Prop({ type: Types.ObjectId, ref: 'Asset', required: true })
  asset: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ required: true, maxlength: 1000 })
  description: string;

  @Prop({ required: true, enum: MaintenancePriority, default: MaintenancePriority.MEDIUM })
  priority: MaintenancePriority;

  @Prop({ required: true, enum: MaintenanceStatus, default: MaintenanceStatus.PENDING })
  status: MaintenanceStatus;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  approvedBy: Types.ObjectId;

  @Prop()
  completedAt: Date;

  @Prop({ type: Number })
  cost: number;

  @Prop({ maxlength: 1000 })
  notes: string;
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);
