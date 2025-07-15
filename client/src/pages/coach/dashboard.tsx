import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  Calendar,
  Target,
  Plus,
  UserPlus,
  BarChart3,
  MessageSquare,
  Settings,
  Activity,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function CoachDashboard() {
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

  const { data: members } = useQuery({
    queryKey: ["/api/communities", community?.id, "members"],
    retry: false,
    enabled: isAuthenticated && community?.id,
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

  const { data: communityWorkouts } = useQuery({
    queryKey: ["/api/workouts/community", community?.id],
    retry: false,
    enabled: isAuthenticated && community?.id,
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

  const { data: todayLogs } = useQuery({
    queryKey: ["/api/workout-logs/community", community?.id, format(new Date(), "yyyy-MM-dd")],
    retry: false,
    enabled: isAuthenticated && community?.id,
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

  const { data: announcements } = useQuery({
    queryKey: ["/api/communities", community?.id, "announcements"],
    retry: false,
    enabled: isAuthenticated && community?.id,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeMembers = members?.filter((member: any) => member.role === "athlete")?.length || 0;
  const coaches = members?.filter((member: any) => member.role === "coach")?.length || 0;
  const todayParticipants = todayLogs?.length || 0;
  const totalWorkouts = communityWorkouts?.length || 0;

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
                  Coach Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  {community?.name || "Your Community"} • {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  {user?.membership?.role === "manager" ? "Manager" : "Coach"}
                </Badge>
                <Button onClick={() => window.location.href = "/community"}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Community
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{activeMembers}</p>
                    <p className="text-sm text-gray-500">Active Athletes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-accent mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{todayParticipants}</p>
                    <p className="text-sm text-gray-500">Today's Participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-success mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{totalWorkouts}</p>
                    <p className="text-sm text-gray-500">Total Workouts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-warning mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{coaches}</p>
                    <p className="text-sm text-gray-500">Coaches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayLogs && todayLogs.length > 0 ? (
                  <div className="space-y-4">
                    {todayLogs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {log.user.firstName?.[0]}{log.user.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{log.user.firstName} {log.user.lastName}</p>
                            <p className="text-sm text-gray-500">{log.workout.name}</p>
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
                    
                    {todayLogs.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline" onClick={() => window.location.href = "/leaderboard"}>
                          View All ({todayLogs.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No activity today yet.</p>
                    <p className="text-sm text-gray-400">Check back later to see athlete progress.</p>
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
                  onClick={() => window.location.href = "/community"}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Members
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = "/community"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workout
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = "/leaderboard"}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = "/community"}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Post Announcement
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Announcements and Workouts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Recent Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {announcements && announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.slice(0, 3).map((announcement: any) => (
                      <div key={announcement.id} className="border-l-4 border-l-primary pl-4">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <p className="text-sm text-gray-600">{announcement.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No announcements yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Recent Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {communityWorkouts && communityWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {communityWorkouts.slice(0, 3).map((workout: any) => (
                      <div key={workout.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{workout.name}</h4>
                          <Badge variant="outline">
                            {workout.type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {workout.description.substring(0, 100)}...
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {workout.timeCap && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{Math.round(workout.timeCap / 60)}min</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {format(new Date(workout.createdAt), "MMM d")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No workouts created yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
