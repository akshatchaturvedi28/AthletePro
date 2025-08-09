import { User } from "@shared/schema";

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
}

// Mock user for frontend-only demo
const mockUser: UserWithMembership = {
  id: "demo-user-1",
  username: "DemoUser",
  email: "demo@athletepro.com",
  firstName: "Demo",
  lastName: "User",
  phoneNumber: "+1234567890",
  occupation: "Athlete",
  bodyWeight: "70",
  bodyHeight: "175",
  yearsOfExperience: 2,
  bio: "Demo user for AthletePro showcase",
  profileImageUrl: null,
  password: null,
  socialHandles: null,
  isRegistered: true,
  registeredAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  membership: {
    id: 1,
    communityId: 1,
    userId: "demo-user-1",
    role: "athlete",
    joinedAt: new Date(),
    community: {
      id: 1,
      name: "Demo CrossFit Box"
    }
  }
};

export function useAuth() {
  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    needsRegistration: false,
  };
}
