import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CommunityLeaderboard } from "@/components/community/leaderboard";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Trophy } from "lucide-react";

export default function CoachLeaderboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: community } = useQuery({
    queryKey: ["/api/communities/my"],
    retry: false,
    enabled: isAuthenticated
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-8 w-8 mr-3 text-primary" />
                Community Leaderboard
              </h1>
              <p className="text-gray-600 mt-2">
                {(community as any)?.name || "Your Community"} • Track athlete performance and rankings
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {(community as any)?.id ? (
          <CommunityLeaderboard communityId={(community as any).id} />
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Community not found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
