import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export function setupProductionAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Simple authentication routes for production
  app.get("/api/login", (req: any, res) => {
    // For production without external auth, create a guest session
    req.session.user = {
      claims: {
        sub: 'guest-user',
        name: 'Guest User',
        email: 'guest@app.com'
      }
    };
    req.session.isGuest = true;
    res.redirect('/');
  });

  app.get("/api/callback", (req, res) => {
    res.redirect('/');
  });

  app.get("/api/logout", (req: any, res) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
      });
    } else {
      res.redirect('/');
    }
  });

  // Middleware to populate req.user from session
  app.use((req: any, res, next) => {
    if (req.session?.user) {
      req.user = req.session.user;
      req.isAuthenticated = () => true;
    } else {
      req.isAuthenticated = () => false;
    }
    next();
  });

  console.log("Production authentication setup completed");
}

export const productionAuthMiddleware: RequestHandler = (req: any, res, next) => {
  // For production without external auth, create a guest user automatically
  if (!req.user) {
    req.user = {
      claims: {
        sub: 'guest-user',
        name: 'Guest User',
        email: 'guest@app.com'
      }
    };
    req.isGuest = true;
  }
  next();
};