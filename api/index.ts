import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// OIDC Authentication for production
interface OIDCTokenResponse {
  access_token: string;
  token_type: string;
  id_token: string;
  expires_in: number;
}

interface OIDCUserInfo {
  sub: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email_verified: boolean;
}

// Define schema tables inline to avoid import issues in Vercel
const userRoleEnum = pgEnum("user_role", ["athlete", "athlete_in_community"]);
const adminRoleEnum = pgEnum("admin_role", ["coach", "community_manager"]);

// User accounts table
const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  phoneNumber: varchar("phone_number"),
  password: varchar("password"),
  occupation: varchar("occupation"),
  bio: varchar("bio"),
  role: userRoleEnum("role").default("athlete"),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  phoneVerificationToken: varchar("phone_verification_token"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  isRegistered: boolean("is_registered").default(false),
  registeredAt: timestamp("registered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin accounts table
const admins = pgTable("admins", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  phoneNumber: varchar("phone_number"),
  password: varchar("password"),
  bio: varchar("bio"),
  role: adminRoleEnum("role").notNull(),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  phoneVerificationToken: varchar("phone_verification_token"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  isRegistered: boolean("is_registered").default(false),
  registeredAt: timestamp("registered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Initialize database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Simple CORS middleware
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://athlete-pro.vercel.app' : 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to create JWT token
function createAuthToken(user: any, accountType: 'user' | 'admin') {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      accountType
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper function to verify JWT token
function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// Helper function to get auth token from request
function getAuthToken(req: VercelRequest): string | null {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try cookies
  const cookies = req.headers.cookie;
  if (cookies) {
    const match = cookies.match(/auth-token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Helper function to set auth cookie
function setAuthCookie(res: VercelResponse, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  // Don't set domain for Vercel - let it use the current domain
  const secure = isProduction ? '; Secure' : '';
  const sameSite = isProduction ? '; SameSite=None' : '; SameSite=Lax';
  
  res.setHeader('Set-Cookie', [
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}${secure}${sameSite}`,
  ]);
  
  console.log(`🍪 Cookie set with params: HttpOnly=true, Path=/, MaxAge=${7 * 24 * 60 * 60}, Secure=${isProduction}, SameSite=${isProduction ? 'None' : 'Lax'}`);
}

// Helper function to clear auth cookie
function clearAuthCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', [
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
  ]);
}

// Workout Parser
interface ParsedWorkout {
  name: string;
  description: string;
  type: string;
  timeCap?: number;
  restBetweenIntervals?: number;
  totalEffort?: number;
  relatedBenchmark?: string;
  barbellLifts?: string[];
  date?: string;
}

function parseWorkout(rawText: string): ParsedWorkout[] {
  const lines = rawText.trim().split('\n').map(line => line.trim()).filter(line => line);
  
  if (lines.length === 0) {
    throw new Error('No workout content provided');
  }

  // For simplicity, create a single workout from the text
  const result: ParsedWorkout = {
    name: 'Custom Workout',
    description: rawText,
    type: 'for_time'
  };

  // Extract date if present
  const dateMatch = rawText.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
  if (dateMatch) {
    result.date = dateMatch[1];
  }

  // Try to extract workout name from common patterns
  const namePatterns = [
    /workout\s*:\s*(.+)/i,
    /wod\s*:\s*(.+)/i,
    /^(.+)$/m // First line as fallback
  ];

  for (const pattern of namePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1] && match[1].trim().length > 3) {
      result.name = match[1].trim();
      break;
    }
  }

  // Determine workout type
  const lowerText = rawText.toLowerCase();
  if (lowerText.includes('for time') || lowerText.includes('rft')) {
    result.type = 'for_time';
  } else if (lowerText.includes('amrap')) {
    result.type = 'amrap';
  } else if (lowerText.includes('emom')) {
    result.type = 'emom';
  } else if (lowerText.includes('strength')) {
    result.type = 'strength';
  }

  // Extract time cap
  const timeCapMatch = rawText.match(/(?:cap|time cap)[:\s]*(\d+)(?:\s*min(?:utes?)?)?/i);
  if (timeCapMatch) {
    result.timeCap = parseInt(timeCapMatch[1]) * 60; // convert to seconds
  }

  // Calculate basic effort based on numbers in the text
  const numbers = rawText.match(/\d+/g);
  if (numbers) {
    result.totalEffort = numbers.reduce((sum, num) => sum + parseInt(num), 0);
  } else {
    result.totalEffort = 100;
  }

  return [result];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, url } = req;
    const pathname = url?.split('?')[0] || '';

    // Route: POST /api/auth/user/signup or /api/auth/signup
    if (method === 'POST' && (pathname === '/api/auth/user/signup' || pathname === '/api/auth/signup')) {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false, 
          error: 'All fields are required' 
        });
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'User already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate UUID for user
      const userId = crypto.randomUUID();

      // Create user
      const newUser = await db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username: `${firstName}${lastName}`.toLowerCase(),
        isRegistered: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          username: newUser[0].username
        },
        redirectUrl: '/athlete/dashboard'
      });
    }

    // Route: POST /api/auth/user/signin or /api/auth/signin
    if (method === 'POST' && (pathname === '/api/auth/user/signin' || pathname === '/api/auth/signin')) {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and password are required' 
        });
      }

      // Find user by email or phone number
      let user;
      // Check if the identifier is an email (contains @) or phone number
      if (email.includes('@')) {
        user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      } else {
        user = await db.select().from(users).where(eq(users.phoneNumber, email)).limit(1);
      }

      if (user.length === 0) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      // Verify password
      if (!user[0].password) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }
      
      const isValidPassword = await bcrypt.compare(password, user[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      // Create auth token and set cookie
      const token = createAuthToken(user[0], 'user');
      setAuthCookie(res, token);

      console.log(`✅ User login successful: ${user[0].email}, redirecting to /athlete/dashboard`);
      console.log(`🔑 JWT Token created for user ${user[0].email}: ${token.substring(0, 20)}...${token.substring(token.length - 20)}`);
      console.log(`🍪 Setting auth cookie for current domain (no domain restriction)`);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          username: user[0].username,
          role: user[0].role
        },
        redirectUrl: '/athlete/dashboard'
      });
    }

    // Route: POST /api/auth/admin/signup
    if (method === 'POST' && pathname === '/api/auth/admin/signup') {
      const { email, password, role, firstName, lastName } = req.body;

      if (!email || !password || !role || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false, 
          error: 'All fields are required' 
        });
      }

      // Check if admin already exists
      const existingAdmin = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
      if (existingAdmin.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Admin user already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate UUID for admin
      const adminId = crypto.randomUUID();

      // Create admin
      const newAdmin = await db.insert(admins).values({
        id: adminId,
        email,
        password: hashedPassword,
        role: role as 'coach' | 'community_manager',
        firstName,
        lastName,
        isRegistered: true,
        registeredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: newAdmin[0].id,
          email: newAdmin[0].email,
          role: newAdmin[0].role,
          firstName: newAdmin[0].firstName,
          lastName: newAdmin[0].lastName
        },
        redirectUrl: '/admin/console'
      });
    }

    // Route: POST /api/auth/admin/signin
    if (method === 'POST' && pathname === '/api/auth/admin/signin') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and password are required' 
        });
      }

      // Find admin
      const admin = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
      if (admin.length === 0) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      // Verify password
      if (!admin[0].password) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }
      
      const isValidPassword = await bcrypt.compare(password, admin[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      // Create auth token and set cookie
      const token = createAuthToken(admin[0], 'admin');
      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: {
          id: admin[0].id,
          email: admin[0].email,
          role: admin[0].role,
          firstName: admin[0].firstName,
          lastName: admin[0].lastName
        },
        redirectUrl: '/coach/dashboard'
      });
    }

    // Route: GET /auth/login - Initiate OIDC login
    if (method === 'GET' && pathname === '/auth/login') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
      
      if (!clientId || !callbackUrl) {
        return res.status(500).json({ error: 'OIDC configuration missing' });
      }

      // Generate OAuth2 authorization URL
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', callbackUrl);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('access_type', 'offline');

      // Redirect to Google OAuth
      return res.redirect(302, authUrl.toString());
    }

    // Route: GET /auth/callback - Handle OIDC callback
    if (method === 'GET' && pathname === '/auth/callback') {
      const { code, error } = req.query;

      if (error) {
        console.error('OAuth error:', error);
        return res.redirect(302, '/login?error=oauth_failed');
      }

      if (!code) {
        return res.redirect(302, '/login?error=no_code');
      }

      try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code: code as string,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }

        const tokens: OIDCTokenResponse = await tokenResponse.json();

        // Get user info from Google
        const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userInfo: OIDCUserInfo = await userInfoResponse.json();

        // Check if user exists, create if not
        let existingUser = await db.select().from(users).where(eq(users.email, userInfo.email)).limit(1);
        
        let user;
        if (existingUser.length > 0) {
          // Update existing user
          user = await db.update(users)
            .set({
              firstName: userInfo.given_name || userInfo.name?.split(' ')[0],
              lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' '),
              profileImageUrl: userInfo.picture,
              isEmailVerified: true,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser[0].id))
            .returning();
          user = user[0];
        } else {
          // Create new user
          const userId = crypto.randomUUID();
          const newUser = await db.insert(users).values({
            id: userId,
            email: userInfo.email,
            firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || 'User',
            lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: userInfo.picture,
            isEmailVerified: true,
            isRegistered: true,
            registeredAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();
          user = newUser[0];
        }

        // Create auth token and set cookie for OIDC login
        const token = createAuthToken(user, 'user');
        setAuthCookie(res, token);

        console.log(`✅ OIDC login successful: ${user.email}, redirecting to /athlete/dashboard`);
        console.log(`🔑 JWT Token created for OIDC user ${user.email}: ${token.substring(0, 20)}...${token.substring(token.length - 20)}`);
        console.log(`🍪 Setting auth cookie for domain: ${process.env.NODE_ENV === 'production' ? '.vercel.app' : 'localhost'}`);

        // Redirect to athlete dashboard after successful OIDC login
        return res.redirect(302, `/athlete/dashboard`);

      } catch (error) {
        console.error('OAuth callback error:', error);
        return res.redirect(302, '/login?error=callback_failed');
      }
    }

    // Route: GET /auth/me - Check current session
    if (method === 'GET' && pathname === '/auth/me') {
      const token = getAuthToken(req);
      console.log(`🔍 /auth/me - Token present: ${!!token}`);
      
      if (token) {
        console.log(`🔑 /auth/me - Token received: ${token.substring(0, 20)}...${token.substring(token.length - 20)}`);
        console.log(`🍪 /auth/me - Cookie header: ${req.headers.cookie ? 'present' : 'missing'}`);
        console.log(`🔐 /auth/me - Authorization header: ${req.headers.authorization ? 'present' : 'missing'}`);
        
        const userData = verifyAuthToken(token);
        console.log(`🔍 /auth/me - Token verified: ${!!userData}, User: ${userData?.email || 'none'}`);
        
        if (userData) {
          console.log(`✅ /auth/me - Returning authenticated user data for: ${userData.email}`);
          return res.status(200).json({
            authenticated: true,
            user: {
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              username: userData.username,
              role: userData.role
            }
          });
        } else {
          console.log(`❌ /auth/me - Token verification failed`);
        }
      } else {
        console.log(`❌ /auth/me - No token found in request`);
      }

      console.log(`❌ /auth/me - Authentication failed`);
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    // Route: GET /api/auth/session - Check current session
    if (method === 'GET' && pathname === '/api/auth/session') {
      const token = getAuthToken(req);
      console.log(`🔍 /api/auth/session - Token present: ${!!token}`);
      
      if (token) {
        const userData = verifyAuthToken(token);
        console.log(`🔍 /api/auth/session - Token verified: ${!!userData}, User: ${userData?.email || 'none'}, AccountType: ${userData?.accountType || 'none'}`);
        if (userData) {
          const responseData = {
            authenticated: true,
            accountType: userData.accountType,
            hasLinkedAccount: false,
            linkedAccountRole: null
          };

          if (userData.accountType === 'user') {
            console.log(`✅ /api/auth/session - Returning user data for ${userData.email}`);
            return res.status(200).json({
              ...responseData,
              user: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                role: userData.role
              },
              admin: null
            });
          } else {
            console.log(`✅ /api/auth/session - Returning admin data for ${userData.email}`);
            return res.status(200).json({
              ...responseData,
              user: null,
              admin: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                role: userData.role
              }
            });
          }
        }
      }

      console.log(`❌ /api/auth/session - Authentication failed`);
      return res.status(200).json({
        authenticated: false,
        user: null,
        admin: null,
        accountType: null,
        hasLinkedAccount: false,
        linkedAccountRole: null
      });
    }

    // Route: POST /api/auth/logout - Logout user
    if (method === 'POST' && pathname === '/api/auth/logout') {
      clearAuthCookie(res);
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    // Route: POST /api/verification/send-code
    if (method === 'POST' && pathname === '/api/verification/send-code') {
      // For now, just return success without actually sending
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Generate a mock verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      return res.status(200).json({
        message: 'Verification code sent successfully',
        // In development, return the code for testing
        code: process.env.NODE_ENV === 'development' ? code : undefined
      });
    }

    // Route: POST /api/workouts/parse
    if (method === 'POST' && pathname === '/api/workouts/parse') {
      const { workoutText } = req.body;
      
      if (!workoutText) {
        return res.status(400).json({ 
          success: false,
          error: 'Workout text is required' 
        });
      }

      try {
        // Parse the workout using the WorkoutParser
        const parsedWorkouts = parseWorkout(workoutText);
        
        return res.status(200).json({
          success: true,
          workouts: parsedWorkouts
        });
      } catch (error) {
        console.error('Workout parsing error:', error);
        return res.status(400).json({
          success: false,
          error: 'Failed to parse workout: ' + (error as Error).message
        });
      }
    }

    // Default response for unmatched routes
    return res.status(404).json({ message: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Server error'
    });
  }
}
