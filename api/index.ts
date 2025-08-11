import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  serial,
  integer,
  text,
  jsonb,
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
      const { rawText } = req.body;
      
      if (!rawText) {
        return res.status(400).json({ 
          success: false,
          error: 'Workout text is required' 
        });
      }

      try {
        // Parse the workout using the WorkoutParser
        const parsedWorkouts = parseWorkout(rawText);
        
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

    // Route: POST /api/workouts - Create workout (requires authentication)
    if (method === 'POST' && pathname === '/api/workouts') {
      const token = getAuthToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      try {
        const { 
          name, 
          description, 
          type, 
          timeCap, 
          totalEffort, 
          communityId,
          relatedBenchmark,
          barbellLifts,
          restBetweenIntervals,
          isPublic
        } = req.body;

        if (!name || !description || !type) {
          return res.status(400).json({ 
            error: 'Name, description, and type are required' 
          });
        }

        // Validate workout type
        const validTypes = ['for_time', 'amrap', 'emom', 'tabata', 'strength', 'interval', 'endurance', 'chipper', 'ladder', 'unbroken'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({ 
            error: 'Invalid workout type' 
          });
        }

        // Create workout table schema (inline to match shared/schema.ts exactly)
        const workoutTypeEnum = pgEnum("workout_type", [
          "for_time",
          "amrap", 
          "emom",
          "tabata",
          "strength",
          "interval",
          "endurance",
          "chipper",
          "ladder",
          "unbroken"
        ]);

        const workouts = pgTable("workouts", {
          id: serial("id").primaryKey(),
          name: varchar("name", { length: 255 }).notNull(),
          description: text("description").notNull(),
          type: workoutTypeEnum("type").notNull(),
          timeCap: integer("time_cap"),
          restBetweenIntervals: integer("rest_between_intervals"),
          totalEffort: integer("total_effort"),
          relatedBenchmark: varchar("related_benchmark", { length: 255 }),
          barbellLifts: jsonb("barbell_lifts"),
          createdBy: varchar("created_by"),
          communityId: integer("community_id"),
          isPublic: boolean("is_public").default(false),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Insert workout into database (let serial ID auto-increment)
        const newWorkout = await db.insert(workouts).values({
          name,
          description,
          type: type as any, // Cast to satisfy enum type
          timeCap: timeCap || null,
          restBetweenIntervals: restBetweenIntervals || null,
          totalEffort: totalEffort || null,
          relatedBenchmark: relatedBenchmark || null,
          barbellLifts: barbellLifts || null,
          createdBy: userData.id,
          communityId: communityId || null,
          isPublic: isPublic || false,
          createdAt: new Date(),
        }).returning();

        console.log(`✅ Workout created successfully: ${newWorkout[0].name} for user ${userData.email}`);

        return res.status(201).json({
          id: newWorkout[0].id,
          name: newWorkout[0].name,
          description: newWorkout[0].description,
          type: newWorkout[0].type,
          timeCap: newWorkout[0].timeCap,
          restBetweenIntervals: newWorkout[0].restBetweenIntervals,
          totalEffort: newWorkout[0].totalEffort,
          relatedBenchmark: newWorkout[0].relatedBenchmark,
          barbellLifts: newWorkout[0].barbellLifts || [],
          createdBy: newWorkout[0].createdBy,
          communityId: newWorkout[0].communityId,
          isPublic: newWorkout[0].isPublic,
          createdAt: newWorkout[0].createdAt,
        });
      } catch (error) {
        console.error('Error creating workout:', error);
        return res.status(500).json({ 
          error: 'Failed to create workout: ' + (error as Error).message
        });
      }
    }

    // Route: POST /api/workout-logs - Create a workout log
    if (method === 'POST' && pathname === '/api/workout-logs') {
      const token = getAuthToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      try {
        const { 
          workoutId,
          date,
          timeTaken,
          totalEffort,
          scaleType = 'rx',
          scaleDescription,
          humanReadableScore,
          finalScore,
          barbellLiftDetails,
          notes
        } = req.body;

        if (!workoutId || !date) {
          return res.status(400).json({ 
            error: 'Workout ID and date are required' 
          });
        }

        // Create workout logs table schema
        const workoutLogs = pgTable("workout_logs", {
          id: serial("id").primaryKey(),
          userId: varchar("user_id").notNull(),
          workoutId: integer("workout_id").notNull(),
          date: varchar("date").notNull(),
          timeTaken: integer("time_taken"),
          totalEffort: integer("total_effort"),
          scaleType: varchar("scale_type").notNull().default("rx"),
          scaleDescription: text("scale_description"),
          humanReadableScore: text("human_readable_score"),
          finalScore: varchar("final_score"),
          barbellLiftDetails: jsonb("barbell_lift_details"),
          notes: text("notes"),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Insert workout log into database
        const newWorkoutLog = await db.insert(workoutLogs).values({
          userId: userData.id,
          workoutId: parseInt(workoutId),
          date,
          timeTaken: timeTaken || null,
          totalEffort: totalEffort || null,
          scaleType,
          scaleDescription: scaleDescription || null,
          humanReadableScore: humanReadableScore || null,
          finalScore: finalScore || null,
          barbellLiftDetails: barbellLiftDetails || null,
          notes: notes || null,
          createdAt: new Date(),
        }).returning();

        console.log(`✅ Workout log created successfully for user ${userData.email} on ${date}`);

        return res.status(201).json({
          id: newWorkoutLog[0].id,
          userId: newWorkoutLog[0].userId,
          workoutId: newWorkoutLog[0].workoutId,
          date: newWorkoutLog[0].date,
          timeTaken: newWorkoutLog[0].timeTaken,
          totalEffort: newWorkoutLog[0].totalEffort,
          scaleType: newWorkoutLog[0].scaleType,
          scaleDescription: newWorkoutLog[0].scaleDescription,
          humanReadableScore: newWorkoutLog[0].humanReadableScore,
          finalScore: newWorkoutLog[0].finalScore,
          barbellLiftDetails: newWorkoutLog[0].barbellLiftDetails,
          notes: newWorkoutLog[0].notes,
          createdAt: newWorkoutLog[0].createdAt,
        });
      } catch (error) {
        console.error('Error creating workout log:', error);
        return res.status(500).json({ 
          error: 'Failed to create workout log: ' + (error as Error).message
        });
      }
    }

    // Route: GET /api/workout-logs/my - Get user's workout logs
    if (method === 'GET' && pathname === '/api/workout-logs/my') {
      const token = getAuthToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      try {
        // Create workout logs table schema to match shared/schema.ts
        const workoutLogs = pgTable("workout_logs", {
          id: serial("id").primaryKey(),
          userId: varchar("user_id").notNull(),
          workoutId: integer("workout_id").notNull(),
          date: varchar("date").notNull(),
          timeTaken: integer("time_taken"),
          totalEffort: integer("total_effort"),
          scaleType: varchar("scale_type").notNull().default("rx"),
          scaleDescription: text("scale_description"),
          humanReadableScore: text("human_readable_score"),
          finalScore: varchar("final_score"),
          barbellLiftDetails: jsonb("barbell_lift_details"),
          notes: text("notes"),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Create workouts table for join
        const workouts = pgTable("workouts", {
          id: serial("id").primaryKey(),
          name: varchar("name", { length: 255 }).notNull(),
          description: text("description").notNull(),
          type: varchar("type").notNull(),
          timeCap: integer("time_cap"),
          restBetweenIntervals: integer("rest_between_intervals"),
          totalEffort: integer("total_effort"),
          relatedBenchmark: varchar("related_benchmark", { length: 255 }),
          barbellLifts: jsonb("barbell_lifts"),
          createdBy: varchar("created_by"),
          communityId: integer("community_id"),
          isPublic: boolean("is_public").default(false),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Fetch workout logs with workout details
        const userWorkoutLogs = await db
          .select({
            id: workoutLogs.id,
            userId: workoutLogs.userId,
            workoutId: workoutLogs.workoutId,
            date: workoutLogs.date,
            timeTaken: workoutLogs.timeTaken,
            totalEffort: workoutLogs.totalEffort,
            scaleType: workoutLogs.scaleType,
            scaleDescription: workoutLogs.scaleDescription,
            humanReadableScore: workoutLogs.humanReadableScore,
            finalScore: workoutLogs.finalScore,
            barbellLiftDetails: workoutLogs.barbellLiftDetails,
            notes: workoutLogs.notes,
            createdAt: workoutLogs.createdAt,
            workout: {
              id: workouts.id,
              name: workouts.name,
              description: workouts.description,
              type: workouts.type,
              timeCap: workouts.timeCap,
              totalEffort: workouts.totalEffort,
            }
          })
          .from(workoutLogs)
          .innerJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
          .where(eq(workoutLogs.userId, userData.id))
          .orderBy(desc(workoutLogs.date))
          .limit(50);

        console.log(`✅ Fetched ${userWorkoutLogs.length} workout logs for user ${userData.email}`);

        return res.status(200).json(userWorkoutLogs);
      } catch (error) {
        console.error('Error fetching workout logs:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch workout logs: ' + (error as Error).message
        });
      }
    }

    // Route: GET /api/progress/insights - Get user's progress insights
    if (method === 'GET' && pathname === '/api/progress/insights') {
      const token = getAuthToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      try {
        // Create workout logs table schema
        const workoutLogs = pgTable("workout_logs", {
          id: serial("id").primaryKey(),
          userId: varchar("user_id").notNull(),
          workoutId: integer("workout_id").notNull(),
          date: varchar("date").notNull(),
          timeTaken: integer("time_taken"),
          totalEffort: integer("total_effort"),
          scaleType: varchar("scale_type").notNull().default("rx"),
          scaleDescription: text("scale_description"),
          humanReadableScore: text("human_readable_score"),
          finalScore: varchar("final_score"),
          barbellLiftDetails: jsonb("barbell_lift_details"),
          notes: text("notes"),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Create workouts table
        const workouts = pgTable("workouts", {
          id: serial("id").primaryKey(),
          name: varchar("name", { length: 255 }).notNull(),
          description: text("description").notNull(),
          type: varchar("type").notNull(),
          timeCap: integer("time_cap"),
          restBetweenIntervals: integer("rest_between_intervals"),
          totalEffort: integer("total_effort"),
          relatedBenchmark: varchar("related_benchmark", { length: 255 }),
          barbellLifts: jsonb("barbell_lifts"),
          createdBy: varchar("created_by"),
          communityId: integer("community_id"),
          isPublic: boolean("is_public").default(false),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Fetch user's workout logs with workout details
        const userWorkoutLogs = await db
          .select({
            id: workoutLogs.id,
            date: workoutLogs.date,
            timeTaken: workoutLogs.timeTaken,
            finalScore: workoutLogs.finalScore,
            humanReadableScore: workoutLogs.humanReadableScore,
            workout: {
              name: workouts.name,
              type: workouts.type,
            }
          })
          .from(workoutLogs)
          .innerJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
          .where(eq(workoutLogs.userId, userData.id))
          .orderBy(desc(workoutLogs.date))
          .limit(50);

        // Calculate insights from the data
        const totalWorkouts = userWorkoutLogs.length;
        
        // Calculate streaks (simplified - just count recent days)
        const currentStreak = Math.min(totalWorkouts, 5); // Mock calculation
        const longestStreak = Math.min(totalWorkouts, 7); // Mock calculation
        
        // Find favorite workout type
        const workoutTypes = userWorkoutLogs.reduce((acc, log) => {
          const type = log.workout.type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const favoriteWorkoutType = Object.entries(workoutTypes)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'for_time';

        // Calculate average score (from numeric final scores)
        const numericScores = userWorkoutLogs
          .map(log => parseFloat(log.finalScore || '0'))
          .filter(score => !isNaN(score) && score > 0);
        const averageScore = numericScores.length > 0 
          ? numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length
          : 0;

        // Get recent progress (last 10 workouts)
        const recentProgress = userWorkoutLogs.slice(0, 10).map(log => ({
          date: log.date,
          workout: {
            name: log.workout.name,
            type: log.workout.type,
          },
          finalScore: parseFloat(log.finalScore || '0') || 0,
          humanReadableScore: log.humanReadableScore || log.finalScore || '0'
        }));

        // Mock personal records for now
        const personalRecords = [
          {
            liftName: 'deadlift',
            repMax: 1,
            weight: 315,
            date: '2025-08-10'
          },
          {
            liftName: 'squat',
            repMax: 1,
            weight: 275,
            date: '2025-08-09'
          }
        ];

        const insights = {
          totalWorkouts,
          currentStreak,
          longestStreak,
          favoriteWorkoutType,
          averageScore,
          personalRecords,
          recentProgress
        };

        console.log(`✅ Fetched detailed progress insights for user ${userData.email}: ${totalWorkouts} workouts`);
        return res.status(200).json(insights);
      } catch (error) {
        console.error('Error fetching progress insights:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch progress insights: ' + (error as Error).message
        });
      }
    }

    // Route: GET /api/olympic-lifts/my - Get user's Olympic lift records
    if (method === 'GET' && pathname === '/api/olympic-lifts/my') {
      const token = getAuthToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      try {
        // For now, return sample Olympic lift data
        // In a full implementation, this would fetch from a dedicated lifts table
        const olympicLifts = [
          {
            id: 1,
            liftName: 'snatch',
            weight: 135,
            repMax: 1,
            date: '2025-08-10',
            userId: userData.id,
            videoUrl: null,
            notes: 'Clean technique, good depth'
          },
          {
            id: 2,
            liftName: 'clean_and_jerk',
            weight: 185,
            repMax: 1,
            date: '2025-08-09',
            userId: userData.id,
            videoUrl: null,
            notes: 'Strong pull, smooth transition'
          },
          {
            id: 3,
            liftName: 'front_squat',
            weight: 225,
            repMax: 1,
            date: '2025-08-08',
            userId: userData.id,
            videoUrl: null,
            notes: 'Full depth, controlled ascent'
          }
        ];

        console.log(`✅ Fetched ${olympicLifts.length} Olympic lift records for user ${userData.email}`);
        return res.status(200).json(olympicLifts);
      } catch (error) {
        console.error('Error fetching Olympic lifts:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch Olympic lifts: ' + (error as Error).message
        });
      }
    }

    // Route: GET /api/workouts/my - Get user's created workouts
    if (method === 'GET' && pathname === '/api/workouts/my') {
      const token = getAuthToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      try {
        // Create workouts table schema
        const workouts = pgTable("workouts", {
          id: serial("id").primaryKey(),
          name: varchar("name", { length: 255 }).notNull(),
          description: text("description").notNull(),
          type: varchar("type").notNull(),
          timeCap: integer("time_cap"),
          restBetweenIntervals: integer("rest_between_intervals"),
          totalEffort: integer("total_effort"),
          relatedBenchmark: varchar("related_benchmark", { length: 255 }),
          barbellLifts: jsonb("barbell_lifts"),
          createdBy: varchar("created_by"),
          communityId: integer("community_id"),
          isPublic: boolean("is_public").default(false),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Fetch user's workouts
        const userWorkouts = await db
          .select()
          .from(workouts)
          .where(eq(workouts.createdBy, userData.id))
          .orderBy(desc(workouts.createdAt))
          .limit(50);

        console.log(`✅ Fetched ${userWorkouts.length} workouts created by user ${userData.email}`);
        return res.status(200).json(userWorkouts);
      } catch (error) {
        console.error('Error fetching user workouts:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch workouts: ' + (error as Error).message
        });
      }
    }

    // Route: GET /api/workouts/community/{id} - Get community workouts
    if (method === 'GET' && pathname.startsWith('/api/workouts/community/')) {
      const token = getAuthToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      const userData = verifyAuthToken(token);
      if (!userData || userData.accountType !== 'user') {
        return res.status(401).json({ 
          error: 'User authentication required' 
        });
      }

      try {
        const communityId = pathname.split('/').pop();
        
        if (!communityId || communityId === 'undefined' || communityId === 'null') {
          return res.status(200).json([]);
        }

        // Create workouts table schema
        const workouts = pgTable("workouts", {
          id: serial("id").primaryKey(),
          name: varchar("name", { length: 255 }).notNull(),
          description: text("description").notNull(),
          type: varchar("type").notNull(),
          timeCap: integer("time_cap"),
          restBetweenIntervals: integer("rest_between_intervals"),
          totalEffort: integer("total_effort"),
          relatedBenchmark: varchar("related_benchmark", { length: 255 }),
          barbellLifts: jsonb("barbell_lifts"),
          createdBy: varchar("created_by"),
          communityId: integer("community_id"),
          isPublic: boolean("is_public").default(false),
          createdAt: timestamp("created_at").defaultNow(),
        });

        // Fetch community workouts
        const communityWorkouts = await db
          .select()
          .from(workouts)
          .where(eq(workouts.communityId, parseInt(communityId)))
          .orderBy(desc(workouts.createdAt))
          .limit(50);

        console.log(`✅ Fetched ${communityWorkouts.length} workouts for community ${communityId}`);
        return res.status(200).json(communityWorkouts);
      } catch (error) {
        console.error('Error fetching community workouts:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch community workouts: ' + (error as Error).message
        });
      }
    }

    // Route: GET /api/benchmark-workouts - Get benchmark workouts
    if (method === 'GET' && pathname === '/api/benchmark-workouts') {
      try {
        // Return some sample benchmark workouts
        const benchmarkWorkouts = [
          {
            id: 1,
            name: "Fran",
            category: "girls",
            description: "21-15-9 reps for time of: Thrusters (95/65 lb), Pull-ups",
            type: "for_time"
          },
          {
            id: 2,
            name: "Murph",
            category: "heroes", 
            description: "For time: 1 mile run, 100 pull-ups, 200 push-ups, 300 air squats, 1 mile run",
            type: "for_time"
          }
        ];

        return res.status(200).json(benchmarkWorkouts);
      } catch (error) {
        console.error('Error fetching benchmark workouts:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch benchmark workouts: ' + (error as Error).message
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
