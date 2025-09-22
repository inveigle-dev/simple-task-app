import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

export enum OrganizationType {
  ROOT = 'ROOT',           // Top-level organization
  SUB = 'SUB',            // Sub-organization
}

@Schema({ timestamps: true })
export class Organization {
  id!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ 
    type: String, 
    enum: Object.values(OrganizationType), 
    default: OrganizationType.ROOT 
  })
  type!: OrganizationType;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  parentId?: Types.ObjectId; // For 2-level hierarchy

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  memberIds!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);