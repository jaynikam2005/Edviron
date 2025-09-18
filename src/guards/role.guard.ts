import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/auth.decorators';
import { UserRole, Permission, hasPermission } from '../auth/permissions';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true; // No role/permission requirements
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userRole = user.role as UserRole;

    // Check role requirements
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    // Check permission requirements
    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        hasPermission(userRole, permission),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Access denied. Missing required permissions.`,
        );
      }
    }

    return true;
  }
}

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Admin can access all resources
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // School users can only access their own school's data
    if (user.role === UserRole.SCHOOL && params.schoolId) {
      if (user.school_id !== params.schoolId) {
        throw new ForbiddenException(
          'Access denied. You can only access your own school data.',
        );
      }
    }

    // Trustee users can only access their own trustee's data
    if (user.role === UserRole.TRUSTEE && params.trusteeId) {
      if (user.trustee_id !== params.trusteeId) {
        throw new ForbiddenException(
          'Access denied. You can only access your own trustee data.',
        );
      }
    }

    // User can only access their own data
    if (user.role === UserRole.USER && params.userId) {
      if (user._id !== params.userId) {
        throw new ForbiddenException(
          'Access denied. You can only access your own data.',
        );
      }
    }

    return true;
  }
}
