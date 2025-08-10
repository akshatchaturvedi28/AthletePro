import express from 'express';
import { dualAuth, type AuthResult, type SignupData } from './dualAuth.js';
import { z } from 'zod';
import './types.js'; // Import type declarations

const router = express.Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(['athlete', 'coach', 'community_manager']).optional(),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * User Console Authentication Routes (Athletes)
 */

// User Sign Up (USU) - User Console
router.post('/user/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = signupSchema.parse(req.body);

    const result = await dualAuth.signupUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Set session
    req.session.user = {
      id: result.user!.id,
      email: result.user!.email || '',
      accountType: 'user',
      role: result.user!.role || 'athlete',
    };

    res.json({
      success: true,
      user: result.user,
      accountType: result.accountType,
      redirectUrl: '/athlete/dashboard' // AHP - Athlete Home Page
    });
  } catch (error) {
    console.error('User signup error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
});

// User Sign In (USI) - User Console
router.post('/user/signin', async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    const result = await dualAuth.signinUser(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // Set session
    req.session.user = {
      id: result.user!.id,
      email: result.user!.email || '',
      accountType: 'user',
      role: result.user!.role || 'athlete',
    };

    // Check for linked admin account
    const linkedAdmin = await dualAuth.getLinkedAdminAccount(email);

    res.json({
      success: true,
      user: result.user,
      accountType: result.accountType,
      hasLinkedAdminAccount: !!linkedAdmin,
      linkedAdminRole: linkedAdmin?.role,
      redirectUrl: '/athlete/dashboard' // AHP - Athlete Home Page
    });
  } catch (error) {
    console.error('User signin error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
});

/**
 * Admin Console Authentication Routes (Coaches & Community Managers)
 */

// Admin Sign Up (ASU) - Admin Console
router.post('/admin/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = signupSchema.parse(req.body);

    if (!role || !['coach', 'community_manager'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either coach or community_manager' });
    }

    const result = await dualAuth.signupAdmin({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Set session
    req.session.user = {
      id: result.admin!.id,
      email: result.admin!.email || '',
      accountType: 'admin',
      role: result.admin!.role,
    };

    // Determine redirect URL based on role
    const redirectUrl = result.admin!.role === 'community_manager' 
      ? '/admin/manage-community' // MCP - Manage Community Page
      : '/admin/coach-dashboard';   // CHP - Coach Home Page

    res.json({
      success: true,
      admin: result.admin,
      accountType: result.accountType,
      redirectUrl
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
});

// Admin Sign In (ASI) - Admin Console
router.post('/admin/signin', async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

    const result = await dualAuth.signinAdmin(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // Set session
    req.session.user = {
      id: result.admin!.id,
      email: result.admin!.email || '',
      accountType: 'admin',
      role: result.admin!.role,
    };

    // Check for linked user account
    const linkedUser = await dualAuth.getLinkedUserAccount(email);

    // Determine redirect URL based on role
    const redirectUrl = result.admin!.role === 'community_manager' 
      ? '/admin/manage-community' // MCP - Manage Community Page
      : '/admin/coach-dashboard';   // CHP - Coach Home Page

    res.json({
      success: true,
      admin: result.admin,
      accountType: result.accountType,
      hasLinkedUserAccount: !!linkedUser,
      linkedUserRole: linkedUser?.role,
      redirectUrl
    });
  } catch (error) {
    console.error('Admin signin error:', error);
    res.status(400).json({ error: 'Invalid input data' });
  }
});

/**
 * Account Transition Routes (As per BRD requirements)
 */

// Transition from User to Admin account
router.post('/transition/user-to-admin', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.accountType !== 'user') {
      return res.status(401).json({ error: 'Must be signed in as user to transition' });
    }

    const userEmail = req.session.user.email;
    const linkedAdmin = await dualAuth.getLinkedAdminAccount(userEmail);

    if (!linkedAdmin) {
      return res.status(404).json({ error: 'No linked admin account found' });
    }

    // Update session to admin
    req.session.user = {
      id: linkedAdmin.id,
      email: linkedAdmin.email || '',
      accountType: 'admin',
      role: linkedAdmin.role,
    };

    const redirectUrl = linkedAdmin.role === 'community_manager' 
      ? '/admin/manage-community'
      : '/admin/coach-dashboard';

    res.json({
      success: true,
      admin: linkedAdmin,
      accountType: 'admin',
      redirectUrl
    });
  } catch (error) {
    console.error('User to admin transition error:', error);
    res.status(500).json({ error: 'Failed to transition accounts' });
  }
});

// Transition from Admin to User account
router.post('/transition/admin-to-user', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.accountType !== 'admin') {
      return res.status(401).json({ error: 'Must be signed in as admin to transition' });
    }

    const adminEmail = req.session.user.email;
    const linkedUser = await dualAuth.getLinkedUserAccount(adminEmail);

    if (!linkedUser) {
      return res.status(404).json({ error: 'No linked user account found' });
    }

    // Update session to user
    req.session.user = {
      id: linkedUser.id,
      email: linkedUser.email || '',
      accountType: 'user',
      role: linkedUser.role || 'athlete',
    };

    res.json({
      success: true,
      user: linkedUser,
      accountType: 'user',
      redirectUrl: '/athlete/dashboard'
    });
  } catch (error) {
    console.error('Admin to user transition error:', error);
    res.status(500).json({ error: 'Failed to transition accounts' });
  }
});

/**
 * Session Management Routes
 */

// Get current session info
router.get('/session', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ authenticated: false });
    }

    const result = await dualAuth.validateSession(req.session.user);

    if (!result.success) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.json({ authenticated: false });
    }

    // Check for linked accounts
    const email = req.session.user.email;
    let hasLinkedAccount = false;
    let linkedAccountRole = null;

    if (req.session.user.accountType === 'user') {
      const linkedAdmin = await dualAuth.getLinkedAdminAccount(email);
      hasLinkedAccount = !!linkedAdmin;
      linkedAccountRole = linkedAdmin?.role;
    } else {
      const linkedUser = await dualAuth.getLinkedUserAccount(email);
      hasLinkedAccount = !!linkedUser;
      linkedAccountRole = linkedUser?.role;
    }

    res.json({
      authenticated: true,
      user: result.user,
      admin: result.admin,
      accountType: result.accountType,
      hasLinkedAccount,
      linkedAccountRole
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Failed to validate session' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

/**
 * Middleware for role-based access control
 */

// Middleware to ensure user console access
export const requireUserAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.user || req.session.user.accountType !== 'user') {
    return res.status(401).json({ error: 'User authentication required' });
  }

  const result = await dualAuth.validateSession(req.session.user);
  if (!result.success) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.user = result.user;
  next();
};

// Middleware to ensure admin console access
export const requireAdminAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.user || req.session.user.accountType !== 'admin') {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const result = await dualAuth.validateSession(req.session.user);
  if (!result.success) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.admin = result.admin;
  next();
};

// Middleware to ensure community manager role
export const requireCommunityManager = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.user || req.session.user.accountType !== 'admin' || req.session.user.role !== 'community_manager') {
    return res.status(403).json({ error: 'Community manager access required' });
  }

  const result = await dualAuth.validateSession(req.session.user);
  if (!result.success || !result.admin || result.admin.role !== 'community_manager') {
    return res.status(403).json({ error: 'Community manager access required' });
  }

  req.admin = result.admin;
  next();
};

// Middleware to ensure coach or community manager role
export const requireCoachOrManager = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.user || req.session.user.accountType !== 'admin') {
    return res.status(403).json({ error: 'Coach or community manager access required' });
  }

  const result = await dualAuth.validateSession(req.session.user);
  if (!result.success || !result.admin || !['coach', 'community_manager'].includes(result.admin.role)) {
    return res.status(403).json({ error: 'Coach or community manager access required' });
  }

  req.admin = result.admin;
  next();
};

export default router;
