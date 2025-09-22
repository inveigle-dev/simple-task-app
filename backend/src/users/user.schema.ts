import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Exclude } from 'class-transformer';

import { Role } from '&backend/auth/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({
  toJSON: {
    virtuals: true,
    transform: true,
  },
  toObject: {
    virtuals: true,
    transform: true,
  },
})
export class User {
  id!: string;

  @Prop({ required: true, type: String, unique: true })
  email!: string;

  @Exclude({ toPlainOnly: true })
  @Prop({ required: true, type: String, select: false })
  password!: string;

  @Prop({ type: Array, default: [Role.VIEWER] })
  roles!: Role[];

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
