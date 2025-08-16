import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/layout/sidebar";
import { ProgressCharts } from "@/components/progress/progress-charts";
import { isUnauthorizedError } from "@/lib/authUtils";
import { TrendingUp } from "lucide-react";

export default function AthleteProgress() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-lg blur opacity-30"></div>
                <div className="relative">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center">
                    <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-4">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    Progress Tracking 📈
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg ml-14">
                    Monitor your fitness journey and track improvements over time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Charts */}
          <ProgressCharts />
        </div>
      </div>
    </div>
  );
}
