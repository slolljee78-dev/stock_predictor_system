import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import stripeCheckoutRouter from "../stripeCheckout";
import { authenticateHeartbeatRequest } from "./heartbeatAuth";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Stripe checkout endpoint
  app.use("/api/stripe", stripeCheckoutRouter);

  // Heartbeat-only health callback for safe scheduler verification and monitoring.
  app.post("/api/scheduled/health", async (req, res) => {
    const heartbeat = await authenticateHeartbeatRequest(req, res);
    if (!heartbeat) return;
    res.json({ success: true, taskUid: heartbeat.taskUid, checkedAt: new Date().toISOString() });
  });

  // Onboarding email sequence processor (runs hourly via Heartbeat)
  app.post("/api/scheduled/onboarding-emails", async (req, res) => {
    const heartbeat = await authenticateHeartbeatRequest(req, res);
    if (!heartbeat) return;
    try {
      const { processOnboardingQueue } = await import("../onboardingEmailService");
      const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
      const result = await processOnboardingQueue(origin);
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process onboarding emails";
      res.status(500).json({ success: false, error: message });
    }
  });

  // Onboarding unsubscribe link handler
  app.get("/api/onboarding/unsubscribe", async (req, res) => {
    try {
      const uid = parseInt(String(req.query.uid), 10);
      if (!uid) { res.status(400).send("Invalid unsubscribe link."); return; }
      const { unsubscribeFromOnboarding } = await import("../onboardingEmailService");
      await unsubscribeFromOnboarding(uid, "");
      res.send("<html><body style='font-family:sans-serif;text-align:center;padding:4rem'><h2>You've been unsubscribed</h2><p>You won't receive any more onboarding emails from Vortextrade.</p><a href='/'>Back to Vortextrade</a></body></html>");
    } catch (error) {
      res.status(500).send("Failed to unsubscribe. Please contact support.");
    }
  });

  // Weekly digest processor (runs every Monday 08:00 UTC via Heartbeat)
  app.post("/api/scheduled/weekly-digest", async (req, res) => {
    const heartbeat = await authenticateHeartbeatRequest(req, res);
    if (!heartbeat) return;
    try {
      const { processWeeklyDigest } = await import("../weeklyDigestService");
      const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
      const result = await processWeeklyDigest(origin);
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process weekly digest";
      res.status(500).json({ success: false, error: message });
    }
  });

  // Weekly digest unsubscribe
  app.get("/api/digest/unsubscribe", async (req, res) => {
    res.send("<html><body style='font-family:sans-serif;text-align:center;padding:4rem'><h2>Unsubscribed from weekly digest</h2><p>You won't receive weekly digest emails from Vortextrade.</p><a href='/'>Back to Vortextrade</a></body></html>");
  });

  // Signal monitoring (runs every 2 hours via Heartbeat)
  app.post("/api/scheduled/signal-monitoring", async (req, res) => {
    const heartbeat = await authenticateHeartbeatRequest(req, res);
    if (!heartbeat) return;
    try {
      const { runSignalMonitoring } = await import("../signalMonitoringJob");
      const config = {
        interval: 0,
        confidenceThreshold: 25,
        maxStocksPerRun: 10,
        notifyOnSignal: true,
        updateSentiment: true,
      };
      await runSignalMonitoring(config);
      res.json({ success: true, message: "Signal monitoring cycle completed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to run signal monitoring";
      res.status(500).json({ success: false, error: message });
    }
  });

  // Alert monitoring (runs every 10 minutes via Heartbeat)
  app.post("/api/scheduled/alert-monitoring", async (req, res) => {
    const heartbeat = await authenticateHeartbeatRequest(req, res);
    if (!heartbeat) return;
    try {
      const { runAlertMonitoringOnce } = await import("../alertMonitoringService");
      const result = await runAlertMonitoringOnce();
      res.json({ success: true, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to run alert monitoring";
      res.status(500).json({ success: false, error: message });
    }
  });

  // Simulator auto-trading (runs on schedule via Heartbeat)
  app.post("/api/scheduled/simulator-auto-trading", async (req, res) => {
    const heartbeat = await authenticateHeartbeatRequest(req, res);
    if (!heartbeat) return;
    try {
      const { processScheduledSimulatorRuns } = await import("../scheduledSimulatorRuns");
      const processed = await processScheduledSimulatorRuns();
      res.json({ success: true, processedRuns: processed.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process scheduled simulator runs";
      res.status(500).json({ success: false, error: message });
    }
  });

  // Version probe - to verify deployment is running latest code
  app.get("/api/version", (_req, res) => {
    res.json({ version: "03f84c6e", brand: "Vortextrade", deployedAt: "2026-07-31", buildTime: new Date().toISOString() });
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Background jobs and alert monitoring are now handled by Heartbeat cron endpoints
    // (/api/scheduled/signal-monitoring every 2h, /api/scheduled/alert-monitoring every 10m)
    // This allows the server to genuinely spin down to zero on Autoscale hosting.
  });
}

startServer().catch(console.error);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  process.exit(0);
});
