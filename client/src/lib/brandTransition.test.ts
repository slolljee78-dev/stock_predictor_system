import { describe, expect, it } from "vitest";
import { brandTransition, isPublicRenameEnabled } from "./brandTransition";

describe("brand transition safeguard", () => {
  it("keeps Vortextrade as the active public identity while Ashenwick is pending clearance", () => {
    expect(brandTransition.active).toMatchObject({
      displayName: "Vortextrade",
      status: "live",
    });
    expect(brandTransition.candidate).toMatchObject({
      displayName: "Ashenwick",
      status: "pending_clearance",
    });
  });

  it("does not permit an automatic public rename", () => {
    expect(isPublicRenameEnabled()).toBe(false);
  });
});
