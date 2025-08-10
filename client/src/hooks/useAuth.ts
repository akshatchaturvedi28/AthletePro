import { useState, useEffect } from 'react';

// Define types inline to avoid import issues
interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  username: string | null;
  phoneNumber: string | null;
  password: string | null;
  occupation: string | null;
  bio: string | null;
  role: "athlete" | "athlete_in_community" | null;
  isEmailVerified: boolean | null;
  emailVerificationToken: string | null;
  phoneVerificationToken: string | null;
  isPhoneVerified: boolean | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  isRegistered: boolean | null;
  registeredAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Admin {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  username: string | null;
  phoneNumber: string | null;
  password: string | null;
  bio: string | null;
  role: "coach" | "community_manager";
  isEmailVerified: boolean | null;
  emailVerificationToken: string | null;
  phoneVerificationToken: string | null;
  isPhoneVerified: boolean | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  isRegistered: boolean | null;
  registeredAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface UserWithMembership extends User {
  membership?: {
    id: number;
    communityId: number;
    userId: string;
    role: string;
    joinedAt: Date;
    community: {
      id: number;
      name: string;
    };
  } | null;
  accountType?: 'user' | 'admin';
}

interface AdminWithCommunity extends Admin {
  accountType: 'admin';
  community?: {
    id: number;
    name: string;
    description: string;
    managerId: string;
  } | null;
}

interface AuthState {
  user: UserWithMembership | AdminWithCommunity | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsRegistration: boolean;
  hasLinkedAccount: boolean;
  linkedAccountRole: string | null;
  accountType: 'user' | 'admin' | null;
}

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
}

interface AuthResult {
  success: boolean;
  user?: UserWithMembership;
  admin?: AdminWithCommunity;
  accountType?: 'user' | 'admin';
  hasLinkedAdminAccount?: boolean;
  hasLinkedUserAccount?: boolean;
  linkedAdminRole?: string;
  linkedUserRole?: string;
  redirectUrl?: string;
  error?: string;
}

let authState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  needsRegistration: false,
  hasLinkedAccount: false,
  linkedAccountRole: null,
  accountType: null
};

let authStateListeners: Array<(state: AuthState) => void> = [];

function notifyListeners() {
  authStateListeners.forEach(listener => listener(authState));
}

function updateAuthState(updates: Partial<AuthState>) {
  authState = { ...authState, ...updates };
  notifyListeners();
}

// Initialize auth state by checking session
async function initializeAuth() {
  console.log('🔍 Initializing auth...');
  try {
    // Try OIDC auth endpoint first
    let response = await fetch('/auth/me', {
      credentials: 'include'
    });
    
    console.log('📡 OIDC auth response:', response.status, response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 OIDC auth data:', data);
      
      if (data.authenticated && data.user) {
        console.log('✅ User authenticated via OIDC:', data.user.email);
        console.log('🔄 Setting auth state for user:', data.user);
        updateAuthState({
          user: { ...data.user, accountType: 'user' },
          isAuthenticated: true,
          isLoading: false,
          needsRegistration: false,
          hasLinkedAccount: false,
          linkedAccountRole: null,
          accountType: 'user'
        });
        return;
      } else {
        console.log('❌ OIDC auth failed - not authenticated or no user data');
      }
    } else {
      console.log('❌ OIDC auth endpoint failed with status:', response.status);
    }
    
    // Fallback to legacy auth endpoint
    console.log('🔄 Trying legacy auth endpoint /api/auth/session');
    response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    
    console.log('📡 Legacy auth response:', response.status, response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Legacy auth data:', data);
      
      if (data.authenticated) {
        const user = data.user || data.admin;
        const accountType = data.accountType;
        const hasLinkedAccount = data.hasLinkedAccount || false;
        const linkedAccountRole = data.linkedAccountRole || null;
        
        console.log('✅ User authenticated via legacy endpoint:', user?.email || 'unknown');
        console.log('🔄 Setting auth state for user:', user, 'accountType:', accountType);
        
        updateAuthState({
          user: { ...user, accountType },
          isAuthenticated: true,
          isLoading: false,
          needsRegistration: false,
          hasLinkedAccount,
          linkedAccountRole,
          accountType
        });
      } else {
        console.log('❌ Legacy auth failed - not authenticated');
        updateAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          needsRegistration: false,
          hasLinkedAccount: false,
          linkedAccountRole: null,
          accountType: null
        });
      }
    } else {
      console.log('❌ Legacy auth endpoint failed with status:', response.status);
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsRegistration: false,
        hasLinkedAccount: false,
        linkedAccountRole: null,
        accountType: null
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize auth:', error);
    updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      needsRegistration: false,
      hasLinkedAccount: false,
      linkedAccountRole: null,
      accountType: null
    });
  }
}

// Authentication functions
export const authService = {
  // User authentication
  async signupUser(data: SignupData): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        updateAuthState({
          user: { ...result.user, accountType: 'user' },
          isAuthenticated: true,
          isLoading: false,
          needsRegistration: false,
          hasLinkedAccount: false,
          linkedAccountRole: null,
          accountType: 'user'
        });
        
        return {
          success: true,
          user: result.user,
          accountType: 'user',
          redirectUrl: result.redirectUrl
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('User signup error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async signinUser(email: string, password: string): Promise<AuthResult> {
    try {
      console.log(`🔐 Frontend: Attempting signin for user: ${email}`);
      
      const response = await fetch('/api/auth/user/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      console.log(`📡 Frontend: Signin response status: ${response.status}, ok: ${response.ok}`);
      console.log(`🍪 Frontend: Response headers:`, Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log(`📋 Frontend: Signin response data:`, result);
      
      if (response.ok && result.success) {
        console.log(`✅ Frontend: Signin successful, updating auth state for user: ${result.user.email}`);
        console.log(`🔄 Frontend: Setting authenticated state with redirectUrl: ${result.redirectUrl}`);
        
        updateAuthState({
          user: { ...result.user, accountType: 'user' },
          isAuthenticated: true,
          isLoading: false,
          needsRegistration: false,
          hasLinkedAccount: result.hasLinkedAdminAccount || false,
          linkedAccountRole: result.linkedAdminRole || null,
          accountType: 'user'
        });
        
        return {
          success: true,
          user: result.user,
          accountType: 'user',
          hasLinkedAdminAccount: result.hasLinkedAdminAccount,
          linkedAdminRole: result.linkedAdminRole,
          redirectUrl: result.redirectUrl
        };
      }
      
      console.log(`❌ Frontend: Signin failed:`, result.error);
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ Frontend: User signin error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Admin authentication
  async signupAdmin(data: SignupData): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        updateAuthState({
          user: { ...result.admin, accountType: 'admin' },
          isAuthenticated: true,
          isLoading: false,
          needsRegistration: false,
          hasLinkedAccount: false,
          linkedAccountRole: null,
          accountType: 'admin'
        });
        
        return {
          success: true,
          admin: result.admin,
          accountType: 'admin',
          redirectUrl: result.redirectUrl
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Admin signup error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async signinAdmin(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/admin/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        updateAuthState({
          user: { ...result.admin, accountType: 'admin' },
          isAuthenticated: true,
          isLoading: false,
          needsRegistration: false,
          hasLinkedAccount: result.hasLinkedUserAccount || false,
          linkedAccountRole: result.linkedUserRole || null,
          accountType: 'admin'
        });
        
        return {
          success: true,
          admin: result.admin,
          accountType: 'admin',
          hasLinkedUserAccount: result.hasLinkedUserAccount,
          linkedUserRole: result.linkedUserRole,
          redirectUrl: result.redirectUrl
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Admin signin error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Account transitions
  async transitionToAdmin(): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/transition/user-to-admin', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        updateAuthState({
          user: { ...result.admin, accountType: 'admin' },
          accountType: 'admin',
          hasLinkedAccount: true,
          linkedAccountRole: 'athlete'
        });
        
        return {
          success: true,
          admin: result.admin,
          accountType: 'admin',
          redirectUrl: result.redirectUrl
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Transition to admin error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async transitionToUser(): Promise<AuthResult> {
    try {
      const response = await fetch('/api/auth/transition/admin-to-user', {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        updateAuthState({
          user: { ...result.user, accountType: 'user' },
          accountType: 'user',
          hasLinkedAccount: true,
          linkedAccountRole: authState.user?.role || 'coach'
        });
        
        return {
          success: true,
          user: result.user,
          accountType: 'user',
          redirectUrl: result.redirectUrl
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Transition to user error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      updateAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsRegistration: false,
        hasLinkedAccount: false,
        linkedAccountRole: null,
        accountType: null
      });
    }
  }
};

// Initialize auth on module load
initializeAuth();

export function useAuth() {
  const [state, setState] = useState<AuthState>(authState);

  useEffect(() => {
    // Add listener for auth state changes
    authStateListeners.push(setState);
    
    // Set initial state
    setState(authState);
    
    // Cleanup
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== setState);
    };
  }, []);

  return {
    ...state,
    signupUser: authService.signupUser,
    signinUser: authService.signinUser,
    signupAdmin: authService.signupAdmin,
    signinAdmin: authService.signinAdmin,
    transitionToAdmin: authService.transitionToAdmin,
    transitionToUser: authService.transitionToUser,
    logout: authService.logout,
    refresh: initializeAuth
  };
}
