import { describe, expect, it } from "vitest";
import { groupAccessWhere, type AdminSession } from "../auth";

describe("groupAccessWhere", () => {
  it("scopes regular admin to their own adminId", () => {
    const regular: AdminSession = {
      adminId: "admin_1",
      email: "a@example.com",
      name: "Admin A",
      isSuperAdmin: false,
    };
    expect(groupAccessWhere("group_123", regular)).toEqual({
      id: "group_123",
      adminId: "admin_1",
    });
  });

  it("allows superadmin to access any group by id without adminId filter", () => {
    const superAdmin: AdminSession = {
      adminId: "super_1",
      email: "super@example.com",
      name: "Super",
      isSuperAdmin: true,
    };
    expect(groupAccessWhere("group_123", superAdmin)).toEqual({
      id: "group_123",
    });
  });
});
