import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AssetStatus } from '../../common/enums/asset-status.enum';
import { AssetCondition } from '../../common/enums/asset-condition.enum';

export type AssetDocument = HydratedDocument<Asset>;

@Schema({ timestamps: true })
export class Asset {
  @Prop({ required: true, unique: true })
  assetTag: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'AssetCategory', required: true })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  department: Types.ObjectId;

  @Prop({ unique: true, sparse: true })
  serialNumber: string;

  @Prop()
  purchaseDate: Date;

  @Prop({ type: Number })
  purchaseCost: number;

  @Prop({ required: true, enum: AssetStatus, default: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @Prop({ required: true, enum: AssetCondition, default: AssetCondition.NEW })
  assetCondition: AssetCondition;

  @Prop()
  location: string;

  @Prop()
  notes: string;

  @Prop({ default: false })
  bookable: boolean;

  @Prop()
  photoUrl: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

// Text index for search
AssetSchema.index({ name: 'text', assetTag: 'text', serialNumber: 'text' });
