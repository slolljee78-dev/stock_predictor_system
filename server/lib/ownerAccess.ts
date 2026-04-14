/**
 * Owner-only access control utilities
 * Determines if a user is the owner/admin of the platform
 */

import { ENV } from '../_core/env';

export interface OwnerAccessContext {
  isOwner: boolean;
  isAdmin: boolean;
  canAccessAdminDashboard: boolean;
}

/**
 * Check if a user is the platform owner
 * Owner is identified by matching openId with ENV.ownerOpenId
 */
export function isOwner(userOpenId: string | undefined): boolean {
  if (!userOpenId || !ENV.ownerOpenId) return false;
  return userOpenId === ENV.ownerOpenId;
}

/**
 * Get owner access context for a user
 */
export function getOwnerAccessContext(user: any): OwnerAccessContext {
  const isAdmin = user?.role === 'admin';
  const ownerStatus = isOwner(user?.openId);

  return {
    isOwner: ownerStatus,
    isAdmin,
    canAccessAdminDashboard: isAdmin || ownerStatus,
  };
}

/**
 * Check if user can access admin features
 */
export function canAccessAdminFeatures(user: any): boolean {
  return user?.role === 'admin' || isOwner(user?.openId);
}
