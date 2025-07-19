import type { Express } from "express";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

export function setupLocalAuth(app: Express) {
  // Set up session for local development
  app.use(session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'local-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Allow non-HTTPS in development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Mock login endpoint for development
  app.get('/api/login', (req: any, res) => {
    // Create a mock user session
    req.session.user = {
      claims: {
        sub: 'local-dev-user',
        name: 'Local Dev User',
        email: 'dev@localhost.com',
        firstName: 'Dev',
        lastName: 'User'
      }
    };
    
    // Redirect to the main app
    res.redirect('/');
  });

  // Mock logout endpoint
  app.get('/api/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.redirect('/');
    });
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
}
