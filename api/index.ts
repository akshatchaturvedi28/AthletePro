import { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

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
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Simple CORS middleware
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

    // Route: POST /api/auth/user/signup
    if (method === 'POST' && pathname === '/api/auth/user/signup') {
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

    // Route: POST /api/auth/user/signin
    if (method === 'POST' && pathname === '/api/auth/user/signin') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and password are required' 
        });
      }

      // Find user
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
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

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          username: user[0].username
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
        redirectUrl: '/coach/dashboard'
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

    // Route: GET /api/auth/session - Check current session
    if (method === 'GET' && pathname === '/api/auth/session') {
      // For now, return not authenticated since we don't have session management
      return res.status(200).json({
        authenticated: false,
        user: null,
        admin: null,
        accountType: null,
        hasLinkedAccount: false,
        linkedAccountRole: null
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
