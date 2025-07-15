import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Calendar,
  Flame,
  Award,
  Clock,
  Zap
} from "lucide-react";
import { format } from "date-fns";

interface ProgressInsights {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  favoriteWorkoutType: string;
  averageScore: number;
  personalRecords: Array<{
    liftName: string;
    repMax: number;
    weight: number;
    date: string;
  }>;
  recentProgress: Array<{
    date: string;
    workout: {
      name: string;
      type: string;
    };
    finalScore: number;
    humanReadableScore: string;
  }>;
}

const workoutTypeColors = {
  for_time: "#FF6B35",
  amrap: "#4ECDC4",
  emom: "#F39C12",
  strength: "#E74C3C",
  tabata: "#9B59B6",
  interval: "#3498DB",
  endurance: "#27AE60",
  chipper: "#E67E22",
  ladder: "#1ABC9C",
  unbroken: "#34495E"
};

export function ProgressCharts() {
  const { data: insights, isLoading } = useQuery<ProgressInsights>({
    queryKey: ["/api/progress/insights"],
    queryFn: async () => {
      const response = await fetch("/api/progress/insights");
      if (!response.ok) throw new Error("Failed to fetch progress insights");
      return response.json();
    }
  });

  const { data: olympicLifts, isLoading: liftsLoading } = useQuery({
    queryKey: ["/api/olympic-lifts/my"],
    queryFn: async () => {
      const response = await fetch("/api/olympic-lifts/my");
      if (!response.ok) throw new Error("Failed to fetch Olympic lifts");
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No progress data available yet.</p>
          <p className="text-sm text-gray-400">Start logging workouts to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const recentProgressData = insights.recentProgress.map((item, index) => ({
    name: item.workout.name,
    score: item.finalScore,
    date: format(new Date(item.date), "MM/dd"),
    type: item.workout.type,
    humanScore: item.humanReadableScore,
    index: insights.recentProgress.length - index
  }));

  const workoutTypeData = insights.recentProgress.reduce((acc, item) => {
    const type = item.workout.type.replace("_", " ");
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(workoutTypeData).map(([type, count]) => ({
    name: type,
    value: count,
    color: workoutTypeColors[type.replace(" ", "_") as keyof typeof workoutTypeColors] || "#95A5A6"
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{insights.totalWorkouts}</p>
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
                <p className="text-2xl font-bold">{insights.currentStreak}</p>
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
                <p className="text-2xl font-bold">{insights.longestStreak}</p>
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
                <p className="text-2xl font-bold">{insights.averageScore.toFixed(1)}</p>
                <p className="text-sm text-gray-500">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Progress</TabsTrigger>
          <TabsTrigger value="types">Workout Types</TabsTrigger>
          <TabsTrigger value="lifts">Personal Records</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Workout Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [
                        props.payload.humanScore || value,
                        props.payload.name
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#FF6B35"
                      strokeWidth={2}
                      dot={{ fill: "#FF6B35" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent workouts found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Workout Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold mb-4">Favorite Workout Type</h4>
                  <Badge variant="outline" className="text-lg py-2 px-4">
                    {insights.favoriteWorkoutType.replace("_", " ").toUpperCase()}
                  </Badge>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(workoutTypeData).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="capitalize">{type}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Personal Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.personalRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.personalRecords.map((pr, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold capitalize">{pr.liftName}</h4>
                          <Badge variant="outline">{pr.repMax}RM</Badge>
                        </div>
                        <div className="text-2xl font-bold text-primary mb-1">
                          {pr.weight}lbs
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(pr.date), "MMM d, yyyy")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No personal records yet.</p>
                  <p className="text-sm text-gray-400">Log workouts with barbell lifts to track your PRs!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
