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
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/progress/insights"],
    retry: false,
    enabled: isAuthenticated,
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

  const todayLogs = Array.isArray(workoutLogs) ? workoutLogs.filter((log: any) => 
    format(new Date(log.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ) : [];

  const recentLogs = Array.isArray(workoutLogs) ? workoutLogs.slice(0, 5) : [];

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
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    {format(new Date(), "EEEE, MMMM d, yyyy")} • Ready to crush your goals?
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {(user as any)?.membership && (
                  <Badge 
                    variant="outline" 
                    className="text-sm bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20 text-primary hover:bg-primary/20 transition-all duration-200"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    {(user as any).membership.community?.name || "Community Member"}
                  </Badge>
                )}
                <Button 
                  onClick={() => window.location.href = "/calendar"}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-3 rounded-xl shadow-lg mr-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      {(insights as any)?.totalWorkouts || 0}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Total Workouts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-red-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl shadow-lg mr-4">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                      {(insights as any)?.currentStreak || 0}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Current Streak 🔥</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-yellow-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-3 rounded-xl shadow-lg mr-4">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                      {(insights as any)?.longestStreak || 0}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Longest Streak 🏆</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg mr-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      {(insights as any)?.personalRecords?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Personal Records 🎯</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced Today's Workouts */}
            <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Today's Workouts
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {todayLogs.length > 0 ? (
                  <div className="space-y-4">
                    {todayLogs.map((log: any) => (
                      <div key={log.id} className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative border-0 bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors duration-200">
                              {log.workout.name}
                            </h3>
                            <Badge 
                              variant={log.scaleType === "rx" ? "default" : "secondary"}
                              className="bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border-primary/20"
                            >
                              {log.scaleType.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            {log.workout.description.substring(0, 120)}...
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                              {log.humanReadableScore || log.finalScore}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              {format(new Date(log.createdAt), "h:mm a")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-full blur-3xl opacity-50"></div>
                      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-6">
                        <Target className="h-10 w-10 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready for action!</h3>
                    <p className="text-gray-500 mb-6">No workouts logged today. Let's change that!</p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => window.location.href = "/calendar"}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Log Your First Workout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Quick Actions
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:border-primary/30 transition-all duration-200 group"
                  onClick={() => window.location.href = "/calendar"}
                >
                  <Calendar className="h-4 w-4 mr-3 group-hover:text-primary transition-colors duration-200" />
                  <span className="group-hover:text-primary transition-colors duration-200">View Calendar</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:border-primary/30 transition-all duration-200 group"
                  onClick={() => window.location.href = "/progress"}
                >
                  <TrendingUp className="h-4 w-4 mr-3 group-hover:text-primary transition-colors duration-200" />
                  <span className="group-hover:text-primary transition-colors duration-200">View Progress</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:border-primary/30 transition-all duration-200 group"
                  onClick={() => window.location.href = "/profile"}
                >
                  <Target className="h-4 w-4 mr-3 group-hover:text-primary transition-colors duration-200" />
                  <span className="group-hover:text-primary transition-colors duration-200">Update Profile</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Recent Activity */}
          <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Recent Activity
                </span>
                <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20">
                  {recentLogs.length} workouts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log: any, index: number) => (
                    <div
                      key={log.id}
                      className="group relative"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                      <div className="relative flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-2 rounded-lg">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                              {log.workout.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(log.date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            {log.humanReadableScore || log.finalScore}
                          </p>
                          <Badge 
                            variant={log.scaleType === "rx" ? "default" : "secondary"} 
                            className="text-xs bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border-primary/20"
                          >
                            {log.scaleType.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-full blur-3xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-6">
                      <Clock className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No recent activity</h3>
                  <p className="text-gray-500">Start your fitness journey today!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
