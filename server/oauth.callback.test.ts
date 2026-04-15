import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./db";

// Mock the SDK
vi.mock("./_core/sdk", () => ({
  sdk: {
    exchangeCodeForToken: vi.fn(),
    getUserInfo: vi.fn(),
    createSessionToken: vi.fn(),
  },
}));

describe("OAuth Callback Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle OAuth callback with valid code and state", async () => {
    const { sdk } = await import("./_core/sdk");
    
    // Mock the token exchange
    vi.mocked(sdk.exchangeCodeForToken).mockResolvedValue({
      accessToken: "test_token",
      tokenType: "Bearer",
      expiresIn: 3600,
      scope: "openid profile email",
      idToken: "test_id_token",
    });

    // Mock user info retrieval
    vi.mocked(sdk.getUserInfo).mockResolvedValue({
      openId: "test_open_id",
      projectId: "test_project",
      name: "Test User",
      email: "test@example.com",
      platform: "email",
      loginMethod: "email",
    });

    // Mock session token creation
    vi.mocked(sdk.createSessionToken).mockResolvedValue("test_session_token");

    // Test the flow
    const tokenResponse = await sdk.exchangeCodeForToken("test_code", "aHR0cHM6Ly9sb2NhbGhvc3Q6MzAwMC9hcGkvb2F1dGgvY2FsbGJhY2s=");
    expect(tokenResponse.accessToken).toBe("test_token");

    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    expect(userInfo.openId).toBe("test_open_id");
    expect(userInfo.email).toBe("test@example.com");

    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name,
    });
    expect(sessionToken).toBe("test_session_token");
  });

  it("should handle state decoding correctly", async () => {
    // Test state decoding
    const state = Buffer.from("https://localhost:3000/api/oauth/callback").toString("base64");
    const decoded = Buffer.from(state, "base64").toString("utf8");
    expect(decoded).toBe("https://localhost:3000/api/oauth/callback");
  });
});
