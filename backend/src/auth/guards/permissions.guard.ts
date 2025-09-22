import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../role.enum';
import { User } from '&backend/users/user.schema';

export const REQUIRED_ROLES_KEY = 'requiredRoles';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      REQUIRED_ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.some(role => user.roles.includes(role));
  }

  static canUserDo(user: User, action: 'create' | 'read' | 'update' | 'delete'): boolean {
    if (!user) return false;

    // OWNER can do everything
    if (user.roles.includes(Role.OWNER)) return true;
    
    // ADMIN can do most things
    if (user.roles.includes(Role.ADMIN)) {
      return action !== 'delete'; // admin can't delete org
    }
    
    // VIEWER can only read
    if (user.roles.includes(Role.VIEWER)) {
      return action === 'read';
    }

    return false;
  }

  static canAccessResource(user: User, resourceUserId: string, resourceOrgId?: string): boolean {
    if (!user) return false;
    
    // User can access own stuff
    if (resourceUserId === user.id) return true;
    
    // If user is OWNER or ADMIN in same org, can access
    if (resourceOrgId && user.organizationId?.toString() === resourceOrgId) {
      return user.roles.includes(Role.OWNER) || user.roles.includes(Role.ADMIN);
    }
    
    return false;
  }
}