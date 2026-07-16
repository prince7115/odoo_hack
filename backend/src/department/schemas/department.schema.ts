import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  parentDepartment: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  head: Types.ObjectId;

  @Prop({ default: true })
  active: boolean;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
