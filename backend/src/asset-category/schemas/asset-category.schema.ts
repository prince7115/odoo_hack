import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AssetCategoryDocument = HydratedDocument<AssetCategory>;

@Schema({ timestamps: true })
export class AssetCategory {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  // MongoDB native - no JSON serialization needed unlike the Java version
  @Prop({ type: Object })
  customFields: Record<string, unknown>;
}

export const AssetCategorySchema = SchemaFactory.createForClass(AssetCategory);
