import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

export function getLocalSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP for local development
      maxAge: sessionTtl,
    },
  });
}

// Simple authentication middleware for local development
export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  // For local development, create a mock user if none exists
  if (!req.user) {
    req.user = {
      claims: {
        sub: 'local-dev-user-' + Date.now(),
        name: 'Local Dev User',
        email: 'dev@localhost.com'
      }
    };
  }
  next();
};

export function setupLocalAuth(app: Express) {
  // Add session middleware
  app.use(getLocalSession());
  
  // Mock login endpoint for local development
  app.post('/api/login', (req: any, res) => {
    req.user = {
      claims: {
        sub: 'local-dev-user',
        name: 'Local Dev User',
        email: 'dev@localhost.com'
      }
    };
    
    // Save user in session
    req.session.user = req.user;
    
    res.json({ 
      message: 'Local development login successful',
      user: req.user 
    });
  });
  
  // Mock logout endpoint
  app.post('/api/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });
  
  // Mock user endpoint
  app.get('/api/auth/user', (req: any, res) => {
    if (req.session.user) {
      res.json({
        user: req.session.user,
        needsRegistration: true // Always show registration flow for local dev
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  // Session middleware to restore user
  app.use((req: any, res, next) => {
    if (req.session.user) {
      req.user = req.session.user;
    }
    next();
  });
}