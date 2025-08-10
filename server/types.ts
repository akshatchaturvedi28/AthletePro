import 'express-session';
import type { UserWithMembership, AdminWithCommunity } from '../shared/schema.js';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      accountType: 'user' | 'admin';
      role: string;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: UserWithMembership;
      admin?: AdminWithCommunity;
    }
  }
}
