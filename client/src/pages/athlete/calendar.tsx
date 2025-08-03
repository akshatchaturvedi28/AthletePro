import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkoutParser } from "@/components/workout/workout-parser";
import { WorkoutLog } from "@/components/workout/workout-log";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Target, 
  Clock,
  Dumbbell,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export default function AthleteCalendar() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showWorkoutParser, setShowWorkoutParser] = useState(false);

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

  const { data: workoutLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
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

  const { data: myWorkouts } = useQuery({
    queryKey: ["/api/workouts/my"],
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

  const { data: communityWorkouts } = useQuery({
    queryKey: ["/api/workouts/community", user?.membership?.community?.id],
    retry: false,
    enabled: !!(isAuthenticated && user?.membership?.community?.id),
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

  const selectedDateLogs = workoutLogs?.filter((log: any) => 
    isSameDay(new Date(log.date), selectedDate)
  ) || [];

  const getWorkoutDates = () => {
    const dates: Date[] = [];
    if (workoutLogs) {
      workoutLogs.forEach((log: any) => {
        dates.push(new Date(log.date));
      });
    }
    return dates;
  };

  const workoutDates = getWorkoutDates();

  const handleWorkoutCreated = (workout: any) => {
    setShowWorkoutParser(false);
    toast({
      title: "Workout Created",
      description: "Your workout has been created successfully.",
    });
  };

  const handleWorkoutLogged = (log: any) => {
    refetchLogs();
    toast({
      title: "Workout Logged",
      description: "Your workout has been logged successfully.",
    });
  };

  const availableWorkouts = [
    ...(myWorkouts || []),
    ...(communityWorkouts || [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Workout Calendar</h1>
                <p className="text-gray-600 mt-2">
                  Plan and track your workouts
                </p>
              </div>
              
              <Button 
                onClick={() => setShowWorkoutParser(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={{
                    workout: workoutDates
                  }}
                  modifiersStyles={{
                    workout: {
                      backgroundColor: 'hsl(15, 100%, 60%)',
                      color: 'white',
                      borderRadius: '50%'
                    }
                  }}
                  className="rounded-md border"
                />
                
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    <span>Workout logged</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                    <span>No workout</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  {format(selectedDate, "MMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateLogs.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateLogs.map((log: any) => (
                      <div key={log.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{log.workout.name}</h4>
                          <Badge variant={log.scaleType === "rx" ? "default" : "secondary"}>
                            {log.scaleType.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {log.workout.type.replace("_", " ").toUpperCase()}
                        </div>
                        <div className="text-primary font-semibold">
                          {log.humanReadableScore || log.finalScore}
                        </div>
                        {log.notes && (
                          <div className="text-sm text-gray-500 mt-2">
                            {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No workouts logged for this date.</p>
                    {availableWorkouts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Available Workouts:</p>
                        {availableWorkouts.slice(0, 3).map((workout: any) => (
                          <div key={workout.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{workout.name}</span>
                            <WorkoutLog
                              workout={workout}
                              onLogCreated={handleWorkoutLogged}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Workouts */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="h-5 w-5 mr-2" />
                Available Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableWorkouts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableWorkouts.map((workout: any) => (
                    <Card key={workout.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{workout.name}</h4>
                          <Badge variant="outline">
                            {workout.type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {workout.description.substring(0, 100)}...
                        </div>
                        <div className="flex items-center justify-between">
                          {workout.timeCap && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{Math.round(workout.timeCap / 60)}min</span>
                            </div>
                          )}
                          <WorkoutLog
                            workout={workout}
                            onLogCreated={handleWorkoutLogged}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No workouts available.</p>
                  <Button 
                    onClick={() => setShowWorkoutParser(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Parser Modal */}
          {showWorkoutParser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Create New Workout</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowWorkoutParser(false)}
                    >
                      ×
                    </Button>
                  </div>
                  <WorkoutParser 
                    onWorkoutCreated={handleWorkoutCreated}
                    communityId={user?.membership?.community?.id}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
