import { SetMetadata } from '@nestjs/common';
import { Role } from '../role.enum';
import { REQUIRED_ROLES_KEY } from '../guards/permissions.guard';

export const RequireRoles = (...roles: Role[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);