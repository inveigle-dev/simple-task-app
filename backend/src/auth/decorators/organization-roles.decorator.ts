import { SetMetadata } from '@nestjs/common';
import { Role } from '../role.enum';

export const ORGANIZATION_ROLES_KEY = 'organizationRoles';
export const OrganizationRoles = (...roles: Role[]) => 
  SetMetadata(ORGANIZATION_ROLES_KEY, roles);