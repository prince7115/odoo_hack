import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ unique: true, sparse: true })
  googleId: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatarUrl: string;

  @Prop({ required: true, enum: Role, default: Role.EMPLOYEE })
  role: Role;

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  department: Types.ObjectId;

  @Prop()
  phone: string;

  @Prop()
  designation: string;

  @Prop({ default: true })
  active: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
