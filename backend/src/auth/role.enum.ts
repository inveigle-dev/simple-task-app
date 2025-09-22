export enum Role {
  OWNER = 'OWNER',       // Full control over organization and sub-organizations
  ADMIN = 'ADMIN',       // Can manage organization resources and users
  VIEWER = 'VIEWER',     // Read-only access to organization resources
}

// Role hierarchy for inheritance
export const ROLE_HIERARCHY = {
  [Role.OWNER]: [Role.ADMIN, Role.VIEWER],
  [Role.ADMIN]: [Role.VIEWER],
  [Role.VIEWER]: []
};
