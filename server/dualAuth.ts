import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db } from './db.js';
import { users, admins, communityMemberships, communities } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import type { User, Admin, UserWithMembership, AdminWithCommunity } from '../shared/schema.js';

export type AuthAccountType = 'user' | 'admin';

export interface AuthResult {
  success: boolean;
  user?: UserWithMembership;
  admin?: AdminWithCommunity;
  accountType?: AuthAccountType;
  error?: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: 'athlete' | 'coach' | 'community_manager';
}

/**
 * Dual Authentication System for AthletePro
 * Implements separate user and admin authentication as per BRD requirements
 */
export class DualAuth {
  
  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate unique user ID
   */
  private generateUserId(): string {
    return nanoid();
  }

  /**
   * Sign up new user (Athlete console)
   */
  async signupUser(data: SignupData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create new user
      const userId = this.generateUserId();
      const [newUser] = await db
        .insert(users)
        .values({
          id: userId,
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          username: data.email, // Default username to email
          role: 'athlete',
          isRegistered: true,
          registeredAt: new Date(),
        })
        .returning();

      // Fetch user with membership info
      const userWithMembership = await this.getUserWithMembership(userId);

      return {
        success: true,
        user: userWithMembership,
        accountType: 'user'
      };
    } catch (error) {
      console.error('User signup error:', error);
      return { success: false, error: 'Failed to create user account' };
    }
  }

  /**
   * Sign up new admin (Admin console)
   */
  async signupAdmin(data: SignupData): Promise<AuthResult> {
    try {
      // Check if admin already exists
      const existingAdmin = await db
        .select()
        .from(admins)
        .where(eq(admins.email, data.email))
        .limit(1);

      if (existingAdmin.length > 0) {
        return { success: false, error: 'Admin with this email already exists' };
      }

      // Validate role
      if (!data.role || !['coach', 'community_manager'].includes(data.role)) {
        return { success: false, error: 'Invalid admin role. Must be coach or community_manager' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create new admin
      const adminId = this.generateUserId();
      const [newAdmin] = await db
        .insert(admins)
        .values({
          id: adminId,
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          username: data.email, // Default username to email
          role: data.role as 'coach' | 'community_manager',
          isRegistered: true,
          registeredAt: new Date(),
        })
        .returning();

      // Fetch admin with community info
      const adminWithCommunity = await this.getAdminWithCommunity(adminId);

      return {
        success: true,
        admin: adminWithCommunity,
        accountType: 'admin'
      };
    } catch (error) {
      console.error('Admin signup error:', error);
      return { success: false, error: 'Failed to create admin account' };
    }
  }

  /**
   * Sign in user (User console)
   */
  async signinUser(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      if (!user.password || !(await this.verifyPassword(password, user.password))) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Fetch user with membership info
      const userWithMembership = await this.getUserWithMembership(user.id);

      return {
        success: true,
        user: userWithMembership,
        accountType: 'user'
      };
    } catch (error) {
      console.error('User signin error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  /**
   * Sign in admin (Admin console)
   */
  async signinAdmin(email: string, password: string): Promise<AuthResult> {
    try {
      // Find admin by email
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.email, email))
        .limit(1);

      if (!admin) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      if (!admin.password || !(await this.verifyPassword(password, admin.password))) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Fetch admin with community info
      const adminWithCommunity = await this.getAdminWithCommunity(admin.id);

      return {
        success: true,
        admin: adminWithCommunity,
        accountType: 'admin'
      };
    } catch (error) {
      console.error('Admin signin error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  }

  /**
   * Get user with membership information
   */
  private async getUserWithMembership(userId: string): Promise<UserWithMembership> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Get membership info if exists
    const membership = await db
      .select({
        id: communityMemberships.id,
        communityId: communityMemberships.communityId,
        userId: communityMemberships.userId,
        role: communityMemberships.role,
        joinedAt: communityMemberships.joinedAt,
        community: {
          id: communities.id,
          name: communities.name,
          location: communities.location,
          description: communities.description,
          socialHandles: communities.socialHandles,
          managerId: communities.managerId,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
        }
      })
      .from(communityMemberships)
      .leftJoin(communities, eq(communityMemberships.communityId, communities.id))
      .where(eq(communityMemberships.userId, userId))
      .limit(1);

    const membershipData = membership[0];
    return {
      ...user,
      membership: membershipData?.community ? {
        ...membershipData,
        community: membershipData.community
      } : undefined
    };
  }

  /**
   * Get admin with community information
   */
  private async getAdminWithCommunity(adminId: string): Promise<AdminWithCommunity> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, adminId))
      .limit(1);

    if (!admin) {
      throw new Error('Admin not found');
    }

    // If community manager, get managed community
    let managedCommunity;
    if (admin.role === 'community_manager') {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.managerId, adminId))
        .limit(1);
      
      managedCommunity = community;
    }

    return {
      ...admin,
      managedCommunity
    };
  }

  /**
   * Check if user has linked admin account
   */
  async getLinkedAdminAccount(email: string): Promise<Admin | null> {
    try {
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.email, email))
        .limit(1);

      return admin || null;
    } catch (error) {
      console.error('Error checking linked admin account:', error);
      return null;
    }
  }

  /**
   * Check if admin has linked user account
   */
  async getLinkedUserAccount(email: string): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user || null;
    } catch (error) {
      console.error('Error checking linked user account:', error);
      return null;
    }
  }

  /**
   * Validate authentication session and return user/admin info
   */
  async validateSession(sessionData: any): Promise<AuthResult> {
    try {
      if (!sessionData || !sessionData.id || !sessionData.accountType) {
        return { success: false, error: 'Invalid session' };
      }

      if (sessionData.accountType === 'user') {
        const userWithMembership = await this.getUserWithMembership(sessionData.id);
        return {
          success: true,
          user: userWithMembership,
          accountType: 'user'
        };
      } else if (sessionData.accountType === 'admin') {
        const adminWithCommunity = await this.getAdminWithCommunity(sessionData.id);
        return {
          success: true,
          admin: adminWithCommunity,
          accountType: 'admin'
        };
      }

      return { success: false, error: 'Invalid account type' };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: 'Session validation failed' };
    }
  }
}

// Export singleton instance
export const dualAuth = new DualAuth();
