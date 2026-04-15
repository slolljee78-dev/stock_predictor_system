import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  console.log("[OAuth] Registering OAuth callback route at /api/oauth/callback");
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    console.log("[OAuth] Callback route hit with query params:", req.query);
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      const errorMsg = "code and state are required";
      console.error("[OAuth] Missing params:", { code: !!code, state: !!state });
      res.status(400).json({ error: errorMsg });
      return;
    }

    try {
      console.log("[OAuth] Callback received with code and state");
      console.log("[OAuth] Exchanging code for token...");
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Token exchange successful", { tokenType: tokenResponse.tokenType, expiresIn: tokenResponse.expiresIn });
      
      console.log("[OAuth] Getting user info...");
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] User info retrieved:", { openId: userInfo.openId, name: userInfo.name, email: userInfo.email });

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId in user info");
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      console.log("[OAuth] Upserting user...");
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });
      console.log("[OAuth] User upserted successfully");

      console.log("[OAuth] Creating session token...");
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });
      console.log("[OAuth] Session token created successfully");

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[OAuth] Setting cookie with options:", { secure: cookieOptions.secure, sameSite: cookieOptions.sameSite, httpOnly: cookieOptions.httpOnly });
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      console.log("[OAuth] Cookie set in response headers:", res.getHeaders()['set-cookie']);
      console.log("[OAuth] Redirecting to /");

      res.redirect(302, "/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[OAuth] Callback failed:", errorMessage);
      if (error instanceof Error) {
        console.error("[OAuth] Error stack:", error.stack);
        console.error("[OAuth] Error name:", error.name);
      }
      console.error("[OAuth] Full error object:", error);
      res.status(500).json({ error: "OAuth callback failed", details: errorMessage });
    }
  });
}
