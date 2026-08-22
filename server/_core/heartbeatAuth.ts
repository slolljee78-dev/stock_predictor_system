import type { Request, Response } from "express";
import { sdk } from "./sdk";

export type HeartbeatAuth = {
  taskUid: string;
};

/**
 * Restricts scheduled endpoints to platform-issued Heartbeat identities.
 * The request body is intentionally not used for authorisation.
 */
export async function authenticateHeartbeatRequest(
  req: Request,
  res: Response,
): Promise<HeartbeatAuth | null> {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ error: "cron-only" });
      return null;
    }
    return { taskUid: user.taskUid };
  } catch (error) {
    console.warn("[Heartbeat] Rejected unauthorised scheduled request", error);
    res.status(403).json({ error: "cron-only" });
    return null;
  }
}
