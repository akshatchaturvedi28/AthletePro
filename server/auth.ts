import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Always use secure cookies in production
      maxAge: sessionTtl,
    },
  }));

  // Middleware to populate req.user from session or create guest user
  app.use((req: any, res, next) => {
    if (req.session?.user) {
      req.user = req.session.user;
      req.isAuthenticated = () => true;
    } else {
      // Create a demo user for all requests
      req.user = {
        claims: {
          sub: 'demo-user',
          name: 'Demo User',
          email: 'demo@athletepro.com'
        }
      };
      req.isAuthenticated = () => true;
    }
    next();
  });

  console.log("Authentication setup completed");
}

// Simple auth middleware that always allows access with demo user
export const authMiddleware: RequestHandler = (req: any, res, next) => {
  if (!req.user) {
    req.user = {
      claims: {
        sub: 'demo-user',
        name: 'Demo User',
        email: 'demo@athletepro.com'
      }
    };
  }
  next();
};
