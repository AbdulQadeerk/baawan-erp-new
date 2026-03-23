import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://stageapi.baawanerp.com';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // Proxy API requests
  app.all("/api-proxy/*", async (req, res) => {
    const targetPath = req.params[0];
    const targetUrl = `${BASE_URL}/${targetPath}`;
    
    console.log(`[Proxy] ${req.method} ${req.url} -> ${targetUrl}`);
    
    try {
      // Pass through most headers, but remove those that might interfere
      const headers: any = { ...req.headers };
      delete headers['host'];
      delete headers['content-length'];
      
      // Ensure JSON content type if not present for POST/PUT
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && !headers['content-type']) {
        headers['content-type'] = 'application/json';
      }
      
      // Add a generic User-Agent if not present
      if (!headers['user-agent']) {
        headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      }
      
      console.log(`[Proxy] Headers:`, JSON.stringify(headers));
      if (req.method !== 'GET') {
        console.log(`[Proxy] Body Type: ${typeof req.body}`);
        console.log(`[Proxy] Body Keys: ${Object.keys(req.body || {}).join(', ')}`);
        console.log(`[Proxy] Body Content:`, JSON.stringify(req.body));
      }
      
      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.method !== 'GET' ? req.body : undefined,
        headers: headers,
        params: req.query,
        timeout: 20000,
        validateStatus: () => true,
      });

      console.log(`[Proxy] Response from ${targetUrl}: ${response.status}`);
      if (response.status >= 400) {
        console.log(`[Proxy] Error Response Data:`, JSON.stringify(response.data));
      }

      // Forward headers from the target API
      const responseHeaders = { ...response.headers };
      delete responseHeaders['transfer-encoding'];
      delete responseHeaders['content-encoding'];
      
      res.status(response.status).set(responseHeaders).send(response.data);
    } catch (error: any) {
      console.error(`[Proxy] Error for ${targetUrl}:`, error.message);
      res.status(502).json({ 
        message: "Proxy Error", 
        error: error.message,
        targetUrl: targetUrl,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  });

  app.get("/api/debug-proxy", async (req, res) => {
    try {
      const testUrl = `${BASE_URL}/api/Auth/CheckSession`;
      const response = await axios.get(testUrl, { timeout: 5000 }).catch(e => e.response || e);
      res.json({
        status: response.status,
        data: response.data,
        target: testUrl
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Changed from "spa" to "custom" to handle index.html manually
    });
    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // 1. Read index.html
        let template = await fs.promises.readFile(
          path.resolve(__dirname, "index.html"),
          "utf-8"
        );

        // 2. Apply Vite HTML transforms. This injects the Vite client, and also
        //    transforms any HTML URLs from Vite plugins, e.g. /src/main.tsx
        template = await vite.transformIndexHtml(url, template);

        // 3. Send the rendered HTML back.
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Test connection to the API
    try {
      console.log(`[Startup] Testing connection to API: ${BASE_URL}/api/Auth/CheckSession`);
      const response = await axios.get(`${BASE_URL}/api/Auth/CheckSession`, { timeout: 5000 }).catch(e => e.response || e);
      console.log(`[Startup] API connection test status: ${response.status || 'No Status'}`);
    } catch (err: any) {
      console.error(`[Startup] API connection test failed:`, err.message);
    }
  });
}

startServer();
