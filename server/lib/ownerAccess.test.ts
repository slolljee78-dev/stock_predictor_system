import { describe, it, expect } from "vitest";
import { getOwnerAccessContext, canAccessAdminFeatures } from "./ownerAccess";

describe("Owner Access Utilities", () => {
  describe("getOwnerAccessContext", () => {
    it("should return non-owner context for regular user", () => {
      const user = { openId: "user-456", role: "user" };
      const context = getOwnerAccessContext(user);

      expect(context.isOwner).toBe(false);
      expect(context.isAdmin).toBe(false);
      expect(context.canAccessAdminDashboard).toBe(false);
    });

    it("should return admin context for non-owner admin user", () => {
      const user = { openId: "user-456", role: "admin" };
      const context = getOwnerAccessContext(user);

      expect(context.isOwner).toBe(false);
      expect(context.isAdmin).toBe(true);
      expect(context.canAccessAdminDashboard).toBe(true);
    });

    it("should handle null user gracefully", () => {
      const context = getOwnerAccessContext(null);

      expect(context.isOwner).toBe(false);
      expect(context.isAdmin).toBe(false);
      expect(context.canAccessAdminDashboard).toBe(false);
    });
  });

  describe("canAccessAdminFeatures", () => {
    it("should return true for admin users", () => {
      const user = { openId: "user-456", role: "admin" };
      expect(canAccessAdminFeatures(user)).toBe(true);
    });

    it("should return false for regular users", () => {
      const user = { openId: "user-456", role: "user" };
      expect(canAccessAdminFeatures(user)).toBe(false);
    });

    it("should return false for null user", () => {
      expect(canAccessAdminFeatures(null)).toBe(false);
    });
  });
});
