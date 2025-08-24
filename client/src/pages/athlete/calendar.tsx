import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedCalendar, CalendarView, WorkoutStatus } from "@/components/ui/enhanced-calendar";
import { WorkoutDayModal } from "@/components/workout/workout-day-modal";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkoutParser } from "@/components/workout/workout-parser";
import { WorkoutLog } from "@/components/workout/workout-log";
import { WorkoutAssignment } from "@/components/workout/workout-assignment";
import { WorkoutClone } from "@/components/workout/workout-clone";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Target, 
  Clock,
  Dumbbell,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isPast } from "date-fns";

export default function AthleteCalendar() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [showDayModal, setShowDayModal] = useState(false);
  const [showWorkoutParser, setShowWorkoutParser] = useState(false);
  const [showWorkoutAssignment, setShowWorkoutAssignment] = useState(false);
  const [showWorkoutClone, setShowWorkoutClone] = useState(false);
  const [showCreateWorkoutOptions, setShowCreateWorkoutOptions] = useState(false);
  const [createWorkoutMode, setCreateWorkoutMode] = useState<'parse' | 'clone'>('parse');
  const [assignmentMode, setAssignmentMode] = useState<'parse' | 'clone' | 'existing'>('existing');
  const [searchQuery, setSearchQuery] = useState('');

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
  });

  const { data: myWorkouts } = useQuery({
    queryKey: ["/api/workouts/my"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: communityWorkouts } = useQuery({
    queryKey: ["/api/workouts/community", (user as any)?.membership?.community?.id],
    retry: false,
    enabled: !!(isAuthenticated && (user as any)?.membership?.community?.id),
  });

  // Fetch assigned workouts for all dates
  const { data: allAssignedWorkouts, refetch: refetchAssignments } = useQuery({
    queryKey: ["/api/workouts/assignments", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/workouts/assignments?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned workouts');
      }
      return response.json();
    },
    retry: false,
    enabled: !!(isAuthenticated && user?.id),
  });

  // Fetch assigned workouts for the selected date specifically
  const { data: selectedDateAssignments } = useQuery({
    queryKey: ["/api/workouts/assignments", user?.id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/workouts/assignments?userId=${user?.id}&date=${dateStr}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned workouts for date');
      }
      return response.json();
    },
    retry: false,
    enabled: !!(isAuthenticated && user?.id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedDateLogs = Array.isArray(workoutLogs) ? workoutLogs.filter((log: any) => 
    isSameDay(new Date(log.date), selectedDate)
  ) : [];

  const getWorkoutDates = () => {
    const dates: Date[] = [];
    if (Array.isArray(workoutLogs)) {
      workoutLogs.forEach((log: any) => {
        dates.push(new Date(log.date));
      });
    }
    return dates;
  };

  const getAssignedWorkoutDates = () => {
    const dates: Date[] = [];
    if (Array.isArray(allAssignedWorkouts)) {
      allAssignedWorkouts.forEach((assignment: any) => {
        dates.push(new Date(assignment.assignedDate));
      });
    }
    return dates;
  };

  const workoutDates = getWorkoutDates();
  const assignedDates = getAssignedWorkoutDates();

  // Process workouts by date for enhanced calendar
  const processWorkoutsByDate = (): Record<string, WorkoutStatus> => {
    const workoutsByDate: Record<string, WorkoutStatus> = {};
    
    // Process assigned workouts
    if (Array.isArray(allAssignedWorkouts)) {
      allAssignedWorkouts.forEach((assignment: any) => {
        const dateKey = format(new Date(assignment.assignedDate), 'yyyy-MM-dd');
        if (!workoutsByDate[dateKey]) {
          workoutsByDate[dateKey] = {
            assigned: [],
            completed: [],
            status: 'available'
          };
        }
        workoutsByDate[dateKey].assigned.push({
          id: assignment.id,
          name: assignment.workout.name,
          type: assignment.workout.type,
          description: assignment.workout.description,
          assignedDate: assignment.assignedDate,
          completedDate: undefined
        });
      });
    }

    // Process completed workouts
    if (Array.isArray(workoutLogs)) {
      workoutLogs.forEach((log: any) => {
        const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
        if (!workoutsByDate[dateKey]) {
          workoutsByDate[dateKey] = {
            assigned: [],
            completed: [],
            status: 'available'
          };
        }
        workoutsByDate[dateKey].completed.push({
          id: log.id,
          name: log.workout.name,
          type: log.workout.type,
          description: log.workout.description,
          assignedDate: undefined,
          completedDate: log.date
        });
      });
    }

    // Determine status for each date
    Object.keys(workoutsByDate).forEach(dateKey => {
      const dayData = workoutsByDate[dateKey];
      const date = new Date(dateKey);
      
      if (dayData.completed.length > 0) {
        dayData.status = 'completed';
      } else if (dayData.assigned.length > 0) {
        if (isPast(date)) {
          dayData.status = 'assigned-missed';
        } else {
          dayData.status = 'assigned-future';
        }
      } else {
        dayData.status = 'available';
      }
    });

    return workoutsByDate;
  };

  const workoutsByDate = processWorkoutsByDate();

  // Get workout data for selected date modal
  const getSelectedDateWorkouts = () => {
    const assignedWorkouts = Array.isArray(selectedDateAssignments) ? selectedDateAssignments : [];
    const completedWorkouts = selectedDateLogs;

    return {
      assigned: assignedWorkouts.map((assignment: any) => ({
        id: assignment.id,
        name: assignment.workout.name,
        type: assignment.workout.type,
        description: assignment.workout.description,
        timeCap: assignment.workout.timeCap,
        assignedDate: assignment.assignedDate,
        workout: assignment.workout,
        workoutSource: assignment.workoutSource
      })),
      completed: completedWorkouts.map((log: any) => ({
        id: log.id,
        name: log.workout.name,
        type: log.workout.type,
        description: log.workout.description,
        finalScore: log.finalScore,
        humanReadableScore: log.humanReadableScore,
        notes: log.notes,
        scaleType: log.scaleType,
        date: log.date,
        workout: log.workout
      }))
    };
  };

  const selectedDateWorkoutData = getSelectedDateWorkouts();

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

  const handleAssignmentCreated = () => {
    refetchLogs();
    refetchAssignments();
    setShowWorkoutAssignment(false);
    toast({
      title: "Workout Assigned",
      description: "Workout has been assigned to the selected date.",
    });
    
    // Reopen day modal after successful assignment (Issue 3 requirement)
    setTimeout(() => {
      setShowDayModal(true);
    }, 200);
  };

  const handleWorkoutCloned = (workout: any) => {
    setShowWorkoutClone(false);
    toast({
      title: "✅ Benchmark Cloned",
      description: `"${workout.name}" has been cloned successfully!`,
    });
    // Optionally refetch workouts to show the new cloned workout
  };

  const availableWorkouts = [
    ...(Array.isArray(myWorkouts) ? myWorkouts : []),
    ...(Array.isArray(communityWorkouts) ? communityWorkouts : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-lg blur opacity-30"></div>
                <div className="relative">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Workout Calendar
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Plan, track, and conquer your fitness journey 💪
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Quick Stats */}
                <div className="hidden lg:flex items-center gap-4 mr-4">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-lg border border-green-300 shadow-sm">
                    <div className="text-sm text-green-700 font-medium">This Month</div>
                    <div className="text-2xl font-bold text-green-800">{selectedDateLogs.length + (allAssignedWorkouts?.length || 0)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-lg border border-blue-300 shadow-sm">
                    <div className="text-sm text-blue-700 font-medium">Streak</div>
                    <div className="text-2xl font-bold text-blue-800">🔥 7</div>
                  </div>
                </div>

                <div className="relative">
                  <Button 
                    onClick={() => setShowCreateWorkoutOptions(!showCreateWorkoutOptions)}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workout
                  </Button>
                  
                  {showCreateWorkoutOptions && (
                    <div className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-sm border rounded-xl shadow-2xl z-10 min-w-[220px] animate-in slide-in-from-top-2 duration-200">
                      <div className="p-3">
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 transition-all duration-200"
                          onClick={() => {
                            setCreateWorkoutMode('parse');
                            setShowWorkoutParser(true);
                            setShowCreateWorkoutOptions(false);
                          }}
                        >
                          <span className="text-lg mr-2">📝</span>
                          Parse New Workout
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 transition-all duration-200"
                          onClick={() => {
                            setShowWorkoutClone(true);
                            setShowCreateWorkoutOptions(false);
                          }}
                        >
                          <span className="text-lg mr-2">🔄</span>
                          Clone Benchmark WOD
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Enhanced Calendar */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <EnhancedCalendar
                  view={calendarView}
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  workoutsByDate={workoutsByDate}
                  onDateSelect={(date: Date) => {
                    setSelectedDate(date);
                    setShowDayModal(true);
                  }}
                  onNavigate={setCurrentDate}
                  onViewChange={setCalendarView}
                  locationFilter={(user as any)?.membership?.community?.name}
                  searchQuery={searchQuery}
                />
                
                {/* Legend */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center bg-green-50 px-3 py-2 rounded-full border border-green-200">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-green-700 font-medium">Completed ✅</span>
                  </div>
                  <div className="flex items-center bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-blue-700 font-medium">Assigned (Future) 📅</span>
                  </div>
                  <div className="flex items-center bg-red-50 px-3 py-2 rounded-full border border-red-200">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full mr-2 shadow-sm"></div>
                    <span className="text-red-700 font-medium">Missed ❌</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                    <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                    <span className="text-gray-600 font-medium">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workout Day Modal */}
          <WorkoutDayModal
            isOpen={showDayModal}
            onClose={() => setShowDayModal(false)}
            date={selectedDate}
            workouts={selectedDateWorkoutData}
            onWorkoutLogged={() => {
              refetchLogs();
              refetchAssignments();
            }}
            onAssignWorkout={() => {
              setAssignmentMode('existing'); // Default to existing for day modal assignments (Issue 3)
              setShowWorkoutAssignment(true);
            }}
          />

          <div className="grid grid-cols-1 gap-6 mt-8">
            {/* Selected Date Details */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5">
                <CardTitle className="flex items-center text-lg">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold">
                      {format(selectedDate, "MMM d, yyyy")}
                    </span>
                    <div className="text-xs text-gray-500 font-normal">
                      {format(selectedDate, "EEEE")}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show completed workouts */}
                  {selectedDateLogs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-600 flex items-center">
                        ✅ Completed Workouts
                      </h4>
                      {selectedDateLogs.map((log: any) => (
                        <div key={log.id} className="border border-green-200 rounded-lg p-3 bg-green-50">
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
                  )}

                  {/* Show assigned workouts */}
                  {Array.isArray(selectedDateAssignments) && selectedDateAssignments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-600 flex items-center">
                        📅 Assigned Workouts
                      </h4>
                      {selectedDateAssignments.map((assignment: any) => (
                        <div key={assignment.id} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{assignment.workout.name}</h4>
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              {assignment.workoutSource.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {assignment.workout.type.replace("_", " ").toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-700 mb-3">
                            {assignment.workout.description.substring(0, 150)}...
                          </div>
                          {assignment.workout.timeCap && (
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Time Cap: {Math.round(assignment.workout.timeCap / 60)} minutes</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <WorkoutLog
                              workout={assignment.workout}
                              workoutSource={assignment.workoutSource || 'girl_wod'}
                              onLogCreated={() => {
                                handleWorkoutLogged;
                                refetchAssignments();
                              }}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-100"
                              onClick={() => setShowDayModal(true)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show empty state only if no workouts and no assignments */}
                  {selectedDateLogs.length === 0 && (!selectedDateAssignments || selectedDateAssignments.length === 0) && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No workouts for this date.</p>
                      
                      <Button 
                        onClick={() => setShowWorkoutAssignment(true)}
                        className="mb-4"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Workout to Date
                      </Button>

                      {availableWorkouts.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Available Workouts:</p>
                          {availableWorkouts.slice(0, 3).map((workout: any) => (
                            <div key={workout.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{workout.name}</span>
                              <WorkoutLog
                                workout={workout}
                                workoutSource="custom_user"
                                onLogCreated={handleWorkoutLogged}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Available Workouts */}
          <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5">
              <CardTitle className="flex items-center text-xl">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Available Workouts
                </span>
                <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-primary/20">
                  {availableWorkouts.length} workouts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {availableWorkouts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableWorkouts.map((workout: any, index: number) => (
                    <div
                      key={workout.id}
                      className="group relative"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                      <Card className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors duration-200">
                                {workout.name}
                              </h4>
                              <div className="flex items-center mt-1">
                                <Badge 
                                  variant="secondary" 
                                  className="bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border-primary/20 text-xs"
                                >
                                  {workout.type.replace("_", " ").toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-2 rounded-lg">
                              <TrendingUp className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {workout.description.substring(0, 120)}...
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {workout.timeCap && (
                                <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full">
                                  <Clock className="h-3 w-3 mr-1 text-gray-500" />
                                  <span className="text-xs text-gray-600 font-medium">
                                    {Math.round(workout.timeCap / 60)}min
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center bg-gradient-to-r from-green-50 to-green-100 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                <span className="text-xs text-green-700 font-medium">Available</span>
                              </div>
                            </div>
                            
                            <WorkoutLog
                              workout={workout}
                              workoutSource="custom_user"
                              onLogCreated={handleWorkoutLogged}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-full blur-3xl opacity-50"></div>
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-6">
                      <Dumbbell className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No workouts available</h3>
                  <p className="text-gray-500 mb-6">Create your first workout to get started on your fitness journey!</p>
                  <Button 
                    onClick={() => setShowWorkoutParser(true)}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                    onWorkoutsCreated={handleWorkoutCreated}
                    communityId={(user as any)?.membership?.community?.id}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phase 1: Workout Assignment Modal */}
          <WorkoutAssignment
            selectedDate={selectedDate}
            userId={user?.id || ""}
            onAssignmentCreated={handleAssignmentCreated}
            isOpen={showWorkoutAssignment}
            onClose={() => setShowWorkoutAssignment(false)}
            initialTab={assignmentMode}
          />

          {/* Workout Clone Modal */}
          <WorkoutClone
            isOpen={showWorkoutClone}
            onClose={() => setShowWorkoutClone(false)}
            onWorkoutCreated={handleWorkoutCloned}
            communityId={(user as any)?.membership?.community?.id}
          />
        </div>
      </div>
    </div>
  );
}
