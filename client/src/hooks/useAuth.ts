import { useQuery } from "@tanstack/react-query";
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

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<UserWithMembership>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (res.status === 403) {
        const errorData = await res.json();
        if (errorData.needsRegistration) {
          throw new Error("NEEDS_REGISTRATION");
        }
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    needsRegistration: error?.message === "NEEDS_REGISTRATION",
  };
}
