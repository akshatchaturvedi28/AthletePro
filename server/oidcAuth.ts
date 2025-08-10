import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import passport from "passport";
import { Strategy as OpenIDConnectStrategy } from "passport-openidconnect";
import { db } from "./db";
import { users, sessions as sessionTable, type UserWithMembership } from "../shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import "./types"; // Import existing type definitions

// OIDC User interface for Passport
interface OIDCUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  claims: any;
}

export function setupOIDCAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // OIDC Strategy Configuration (Google)
  passport.use(new OpenIDConnectStrategy({
    issuer: 'https://accounts.google.com',
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/callback',
    scope: ['openid', 'profile', 'email']
  }, async (issuer: string, profile: any, done: any) => {
    try {
      console.log('OIDC Profile received:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
        photos: profile.photos
      });

      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in profile'), null);
      }

      // Check if user exists
      let existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      let user;
      if (existingUser.length > 0) {
        // Update existing user with latest profile info
        const updatedUser = await db.update(users)
          .set({
            firstName: profile.name?.givenName || profile.displayName?.split(' ')[0],
            lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' '),
            profileImageUrl: profile.photos?.[0]?.value,
            isEmailVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser[0].id))
          .returning();
        
        user = updatedUser[0];
      } else {
        // Create new user
        const newUser = await db.insert(users).values({
          id: nanoid(),
          email: email,
          firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
          lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
          profileImageUrl: profile.photos?.[0]?.value,
          isEmailVerified: true,
          isRegistered: true,
          registeredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();
        
        user = newUser[0];
      }

      // Create session user that matches expected type
      const sessionUser = {
        id: user.id,
        email: user.email!,
        accountType: 'user' as const,
        role: user.role || 'athlete',
      };

      return done(null, sessionUser);
    } catch (error) {
      console.error('Error in OIDC strategy:', error);
      return done(error, null);
    }
  }));

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const userResult = await db.select().from(users).where(eq(users.id, id)).limit(1);
      
      if (userResult.length === 0) {
        return done(null, false);
      }

      const user = userResult[0];
      const sessionUser = {
        id: user.id,
        email: user.email!,
        accountType: 'user' as const,
        role: user.role || 'athlete',
      };

      done(null, sessionUser);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });

  // Auth routes
  app.get('/auth/login', passport.authenticate('openidconnect'));

  app.get('/auth/callback', 
    passport.authenticate('openidconnect', { failureRedirect: '/login' }),
    (req, res) => {
      // Store user in session (req.user comes from passport strategy)
      if (req.user) {
        req.session.user = req.user as any;
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session:', err);
            return res.redirect('/login?error=session_failed');
          }
          console.log('Session saved successfully for user:', req.session.user?.email);
          // Redirect to root instead of dashboard to let client-side routing handle it
          res.redirect('/?authenticated=true');
        });
      } else {
        console.error('No user found in callback');
        res.redirect('/login');
      }
    }
  );

  app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Check auth status endpoint
  app.get('/auth/me', (req, res) => {
    console.log('Auth status check:', {
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      sessionId: req.session?.id,
      user: req.session?.user
    });
    
    if (req.session?.user) {
      res.json({ user: req.session.user, authenticated: true });
    } else {
      res.json({ user: null, authenticated: false });
    }
  });

  // Debug endpoint to check session status (remove in production)
  app.get('/auth/debug', (req, res) => {
    res.json({
      hasSession: !!req.session,
      sessionId: req.session?.id,
      hasUser: !!req.session?.user,
      user: req.session?.user,
      cookies: req.headers.cookie,
      environment: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  // Middleware to populate req.user from session
  app.use(async (req: any, res, next) => {
    if (req.session?.user) {
      // Fetch full user data for req.user while keeping session lightweight
      try {
        const userResult = await db.select().from(users).where(eq(users.id, req.session.user.id)).limit(1);
        if (userResult.length > 0) {
          req.user = userResult[0] as UserWithMembership;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      req.isAuthenticated = () => true;
    } else {
      req.user = null;
      req.isAuthenticated = () => false;
    }
    next();
  });

  console.log("OIDC Authentication setup completed");
}

// Auth middleware that requires authentication
export const requireAuth: RequestHandler = (req: any, res, next) => {
  if (req.session?.user) {
    next();
  } else {
    res.status(401).json({ 
      error: 'Authentication required',
      redirectTo: '/auth/login'
    });
  }
};

// Optional auth middleware that works with or without authentication
export const optionalAuth: RequestHandler = (req: any, res, next) => {
  // User info is already populated by the middleware above
  next();
};
