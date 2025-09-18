import { SetMetadata } from '@nestjs/common';
import { UserRole, Permission } from '../auth/permissions';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Utility decorators for common role combinations
export const AdminOnly = () => Roles(UserRole.ADMIN);
export const SchoolOrAdmin = () => Roles(UserRole.SCHOOL, UserRole.ADMIN);
export const TrusteeOrAdmin = () => Roles(UserRole.TRUSTEE, UserRole.ADMIN);
export const AllRoles = () =>
  Roles(UserRole.ADMIN, UserRole.SCHOOL, UserRole.TRUSTEE, UserRole.USER);
