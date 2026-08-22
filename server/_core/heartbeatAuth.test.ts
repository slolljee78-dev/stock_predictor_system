import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticateRequest = vi.fn();

vi.mock("./sdk", () => ({
  sdk: { authenticateRequest },
}));

const { authenticateHeartbeatRequest } = await import("./heartbeatAuth");

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe("authenticateHeartbeatRequest", () => {
  beforeEach(() => authenticateRequest.mockReset());

  it("rejects a normal signed-in user", async () => {
    authenticateRequest.mockResolvedValue({ id: 1, isCron: false });
    const response = createResponse();

    await expect(authenticateHeartbeatRequest({} as any, response as any)).resolves.toBeNull();
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ error: "cron-only" });
  });

  it("returns the platform task UID for an authenticated Heartbeat request", async () => {
    authenticateRequest.mockResolvedValue({ id: -1, isCron: true, taskUid: "task_signal_monitoring" });
    const response = createResponse();

    await expect(authenticateHeartbeatRequest({} as any, response as any)).resolves.toEqual({
      taskUid: "task_signal_monitoring",
    });
    expect(response.status).not.toHaveBeenCalled();
  });

  it("rejects a scheduler identity without a platform task identifier", async () => {
    authenticateRequest.mockResolvedValue({ id: -1, isCron: true });
    const response = createResponse();

    await expect(authenticateHeartbeatRequest({} as any, response as any)).resolves.toBeNull();
    expect(response.status).toHaveBeenCalledWith(403);
  });
});
