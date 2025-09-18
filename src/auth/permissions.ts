export enum UserRole {
  ADMIN = 'admin',
  SCHOOL = 'school',
  TRUSTEE = 'trustee',
  USER = 'user',
}

export enum Permission {
  // User permissions
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',

  // Transaction permissions
  READ_ALL_TRANSACTIONS = 'read:all_transactions',
  READ_SCHOOL_TRANSACTIONS = 'read:school_transactions',
  READ_OWN_TRANSACTIONS = 'read:own_transactions',
  CREATE_TRANSACTION = 'create:transaction',
  UPDATE_TRANSACTION = 'update:transaction',
  DELETE_TRANSACTION = 'delete:transaction',

  // Order permissions
  CREATE_ORDER = 'create:order',
  READ_ORDER = 'read:order',
  UPDATE_ORDER = 'update:order',
  DELETE_ORDER = 'delete:order',

  // User management permissions
  CREATE_USER = 'create:user',
  READ_ALL_USERS = 'read:all_users',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',

  // System permissions
  MANAGE_WEBHOOKS = 'manage:webhooks',
  VIEW_ANALYTICS = 'view:analytics',
  MANAGE_SYSTEM = 'manage:system',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.READ_ALL_TRANSACTIONS,
    Permission.CREATE_TRANSACTION,
    Permission.UPDATE_TRANSACTION,
    Permission.DELETE_TRANSACTION,
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.UPDATE_ORDER,
    Permission.DELETE_ORDER,
    Permission.CREATE_USER,
    Permission.READ_ALL_USERS,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_WEBHOOKS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SYSTEM,
  ],

  [UserRole.SCHOOL]: [
    // School-specific permissions
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.READ_SCHOOL_TRANSACTIONS,
    Permission.CREATE_TRANSACTION,
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.VIEW_ANALYTICS,
  ],

  [UserRole.TRUSTEE]: [
    // Trustee-specific permissions
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.READ_SCHOOL_TRANSACTIONS,
    Permission.CREATE_TRANSACTION,
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.VIEW_ANALYTICS,
  ],

  [UserRole.USER]: [
    // Basic user permissions
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.READ_OWN_TRANSACTIONS,
    Permission.CREATE_ORDER,
  ],
};

export function hasPermission(
  userRole: UserRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

export function getUserPermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole];
}
