import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkoutLog } from "@/components/workout/workout-log";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock,
  Trophy,
  Flame,
  Plus,
  Dumbbell,
  Users,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

export default function AthleteDashboard() {
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

  const { data: workoutLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/workout-logs/my"],
    retry: false,
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
    }
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/progress/insights"],
    retry: false,
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
    }
  });

  const { data: benchmarkWorkouts } = useQuery({
    queryKey: ["/api/benchmark-workouts"],
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

  const todayLogs = workoutLogs?.filter((log: any) => 
    format(new Date(log.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ) || [];

  const recentLogs = workoutLogs?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600 mt-2">
                  {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {user?.membership && (
                  <Badge variant="outline" className="text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {user.membership.community?.name || "Community Member"}
                  </Badge>
                )}
                <Button onClick={() => window.location.href = "/calendar"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{insights?.totalWorkouts || 0}</p>
                    <p className="text-sm text-gray-500">Total Workouts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Flame className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{insights?.currentStreak || 0}</p>
                    <p className="text-sm text-gray-500">Current Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{insights?.longestStreak || 0}</p>
                    <p className="text-sm text-gray-500">Longest Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-accent mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{insights?.personalRecords?.length || 0}</p>
                    <p className="text-sm text-gray-500">Personal Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Workouts */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayLogs.length > 0 ? (
                  <div className="space-y-4">
                    {todayLogs.map((log: any) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{log.workout.name}</h3>
                          <Badge variant={log.scaleType === "rx" ? "default" : "secondary"}>
                            {log.scaleType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {log.workout.description.substring(0, 100)}...
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-semibold">
                            {log.humanReadableScore || log.finalScore}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(log.createdAt), "h:mm a")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No workouts logged today.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => window.location.href = "/calendar"}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log Your First Workout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = "/calendar"}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = "/progress"}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = "/profile"}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Dumbbell className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{log.workout.name}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(log.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {log.humanReadableScore || log.finalScore}
                        </p>
                        <Badge variant={log.scaleType === "rx" ? "default" : "secondary"} className="text-xs">
                          {log.scaleType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
