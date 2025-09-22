import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '&backend/auth/role.enum';

export type PermissionDocument = HydratedDocument<Permission>;

export enum Resource {
  TASK = 'TASK',
  USER = 'USER', 
  ORGANIZATION = 'ORGANIZATION',
}

export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Schema({ timestamps: true })
export class Permission {
  id!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId!: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(Role), 
    required: true 
  })
  role!: Role;

  @Prop({ 
    type: String, 
    enum: Object.values(Resource), 
    required: true 
  })
  resource!: Resource;

  @Prop({ 
    type: [String], 
    enum: Object.values(Action), 
    required: true 
  })
  actions!: Action[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Index for performance
PermissionSchema.index({ userId: 1, organizationId: 1, resource: 1 });