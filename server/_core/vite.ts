import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: false,
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);
      // Strip out Vite client injection to prevent WebSocket errors
      page = page.replace(/<script[^>]*src="\/@vite\/client"[^>]*><\/script>/g, "");
      page = page.replace(/<script[^>]*type="module"[^>]*src="\/@vite\/client"[^>]*><\/script>/g, "");
      // Replace any stale branding injected by VITE_APP_TITLE env var
      page = page
        .replace(/Stock Predictor/g, "Vortextrade")
        .replace(/STOCK PREDICTOR/g, "VORTEXTRADE")
        .replace(/stock predictor/g, "vortextrade")
        .replace(/Manus Stock Predictor/g, "Vortextrade");
      // Force browser to reload HTML and not use cache
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Serve all static assets EXCEPT index.html so that all HTML requests
  // always pass through the branding rewrite handler below.
  app.use(express.static(distPath, { index: false }));

  // All routes (including /) fall through here so we can rewrite stale branding
  // injected by the VITE_APP_TITLE env var before serving the HTML.
  app.use((_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("Not found");
    }
    let html = fs.readFileSync(indexPath, "utf-8");
    // Replace any remaining Stock Predictor references with Vortextrade
    html = html
      .replace(/Stock Predictor/g, "Vortextrade")
      .replace(/STOCK PREDICTOR/g, "VORTEXTRADE")
      .replace(/stock predictor/g, "vortextrade")
      .replace(/Manus Stock Predictor/g, "Vortextrade")
      .replace(/stockpredictor/g, "vortextrade");
    res.set({
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    }).send(html);
  });
}
