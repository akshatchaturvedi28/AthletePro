import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

function validateEnvironmentVariables() {
  const required = ["DATABASE_URL"];
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
  
  // Validate authentication-related variables for production
  if (process.env.NODE_ENV === "production") {
    const authRequired = ["SESSION_SECRET", "REPL_ID", "REPLIT_DOMAINS"];
    const authMissing = authRequired.filter(env => !process.env[env]);
    
    if (authMissing.length > 0) {
      console.error(`Missing required authentication environment variables for production: ${authMissing.join(", ")}`);
      process.exit(1);
    }
  }
  
  log("Environment variables validated successfully");
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Validate environment variables before starting server
    validateEnvironmentVariables();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use PORT environment variable for Cloud Run compatibility
    // Fall back to 5000 for local development
    const port = parseInt(process.env.PORT || "5000", 10);
    
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port number: ${process.env.PORT || "5000"}`);
    }
    
    // Error handling for server startup
    const serverInstance = server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    }).on('error', (err) => {
      console.error('Server startup error:', err);
      process.exit(1);
    });
    
    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      serverInstance.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      serverInstance.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
