import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Trophy, 
  Calendar,
  Target,
  Users,
  MapPin,
  Briefcase,
  Instagram,
  Link as LinkIcon,
  Activity,
  TrendingUp,
  Award,
  Clock,
  Flame,
  Dumbbell
} from "lucide-react";

interface AthleteProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  occupation: string;
  yearsOfExperience: string;
  communityName: string;
  joinedAt: string;
  totalWorkouts: number;
  totalPRs: number;
  currentStreak: number;
  socialHandles: {
    instagram?: string;
    strava?: string;
  };
}

interface PersonalRecord {
  id: string;
  workoutName: string;
  workoutType: string;
  score: string;
  achievedAt: string;
  isRx: boolean;
}

interface RecentWorkout {
  id: string;
  workoutName: string;
  workoutType: string;
  score: string;
  completedAt: string;
  isPR: boolean;
  isRx: boolean;
}

interface Goal {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
}

// Mock data for demonstration - replace with actual API calls
const mockProfile: AthleteProfile = {
  id: '1',
  username: 'athlete123',
  name: 'Sarah Johnson',
  bio: 'CrossFit enthusiast for 3 years. Love challenging WODs and the community spirit!',
  occupation: 'Software Engineer',
  yearsOfExperience: '3',
  communityName: 'CrossFit Downtown',
  joinedAt: '2022-03-15',
  totalWorkouts: 127,
  totalPRs: 23,
  currentStreak: 5,
  socialHandles: {
    instagram: '@sarahcrossfit',
    strava: 'sarah.johnson'
  }
};

const mockPRs: PersonalRecord[] = [
  { id: '1', workoutName: 'Fran', workoutType: 'For Time', score: '4:23', achievedAt: '2024-01-15', isRx: true },
  { id: '2', workoutName: 'Deadlift', workoutType: '1RM', score: '285 lbs', achievedAt: '2024-01-10', isRx: true },
  { id: '3', workoutName: 'Murph', workoutType: 'For Time', score: '42:15', achievedAt: '2024-01-05', isRx: false },
  { id: '4', workoutName: 'Back Squat', workoutType: '1RM', score: '205 lbs', achievedAt: '2023-12-20', isRx: true },
  { id: '5', workoutName: 'Cindy', workoutType: 'AMRAP 20', score: '18 rounds', achievedAt: '2023-12-15', isRx: true },
];

const mockRecentWorkouts: RecentWorkout[] = [
  { id: '1', workoutName: 'Helen', workoutType: 'For Time', score: '9:45', completedAt: '2024-01-20', isPR: false, isRx: true },
  { id: '2', workoutName: 'Annie', workoutType: 'For Time', score: '8:32', completedAt: '2024-01-19', isPR: true, isRx: true },
  { id: '3', workoutName: 'Clean & Jerk', workoutType: '5RM', score: '135 lbs', completedAt: '2024-01-18', isPR: false, isRx: true },
  { id: '4', workoutName: 'WOD 240117', workoutType: 'AMRAP 15', score: '12 rounds + 5', completedAt: '2024-01-17', isPR: false, isRx: true },
];

const mockGoals: Goal[] = [
  { id: '1', description: 'Complete Murph under 40 minutes', isCompleted: false },
  { id: '2', description: 'Deadlift 300 lbs', isCompleted: false },
  { id: '3', description: 'Master butterfly pull-ups', isCompleted: false },
  { id: '4', description: 'Complete first unassisted pull-up', isCompleted: true, completedAt: '2023-06-15' },
];

export default function PublicProfile({ athleteId }: { athleteId?: string }) {
  const [activeTab, setActiveTab] = useState('overview');

  // In a real app, these would fetch data based on athleteId
  const profile = mockProfile;
  const personalRecords = mockPRs;
  const recentWorkouts = mockRecentWorkouts;
  const goals = mockGoals;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/api/placeholder/100/100" />
              <AvatarFallback className="text-lg">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-gray-600">@{profile.username}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Athlete</Badge>
                <Badge variant="outline">{profile.communityName}</Badge>
                <Badge variant="outline">{profile.yearsOfExperience} years experience</Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {profile.occupation}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.joinedAt).toLocaleDateString()}
                </div>
              </div>
              
              {profile.bio && (
                <p className="text-gray-700 max-w-2xl">{profile.bio}</p>
              )}
              
              {/* Social Links */}
              {(profile.socialHandles.instagram || profile.socialHandles.strava) && (
                <div className="flex gap-3">
                  {profile.socialHandles.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://instagram.com/${profile.socialHandles.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  {profile.socialHandles.strava && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://strava.com/athletes/${profile.socialHandles.strava}`} target="_blank" rel="noopener noreferrer">
                        <Activity className="h-4 w-4 mr-2" />
                        Strava
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              All time completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Records</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.totalPRs}</div>
            <p className="text-xs text-muted-foreground">
              +3 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.isCompleted).length}/{goals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Goals achieved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="prs">Personal Records</TabsTrigger>
          <TabsTrigger value="workouts">Recent Workouts</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentWorkouts.slice(0, 5).map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${workout.isPR ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <div>
                          <p className="text-sm font-medium">{workout.workoutName}</p>
                          <p className="text-xs text-gray-500">
                            {workout.score} • {new Date(workout.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {workout.isPR && <Badge variant="secondary">PR</Badge>}
                        {workout.isRx && <Badge variant="outline">Rx</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Personal Records */}
            <Card>
              <CardHeader>
                <CardTitle>Top Personal Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {personalRecords.slice(0, 5).map((pr) => (
                    <div key={pr.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">{pr.workoutName}</p>
                          <p className="text-xs text-gray-500">
                            {pr.workoutType} • {new Date(pr.achievedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">{pr.score}</span>
                        {pr.isRx && <Badge variant="outline">Rx</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${goal.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={goal.isCompleted ? 'line-through text-gray-500' : ''}>
                        {goal.description}
                      </span>
                    </div>
                    {goal.isCompleted && (
                      <Badge variant="secondary">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                ))}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((goals.filter(g => g.isCompleted).length / goals.length) * 100)}%</span>
                  </div>
                  <Progress value={(goals.filter(g => g.isCompleted).length / goals.length) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Records</CardTitle>
              <p className="text-sm text-gray-600">Best performances across different workout categories</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalRecords.map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <div>
                        <h3 className="font-semibold">{pr.workoutName}</h3>
                        <p className="text-sm text-gray-600">{pr.workoutType}</p>
                        <p className="text-xs text-gray-500">
                          Achieved on {new Date(pr.achievedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{pr.score}</div>
                      {pr.isRx && <Badge variant="outline" className="mt-1">Rx</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <p className="text-sm text-gray-600">Latest workout completions and scores</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${workout.isPR ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                      <div>
                        <h3 className="font-semibold">{workout.workoutName}</h3>
                        <p className="text-sm text-gray-600">{workout.workoutType}</p>
                        <p className="text-xs text-gray-500">
                          Completed on {new Date(workout.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{workout.score}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        {workout.isPR && <Badge variant="secondary">PR</Badge>}
                        {workout.isRx && <Badge variant="outline">Rx</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Goals</CardTitle>
              <p className="text-sm text-gray-600">Fitness milestones and achievements</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Completed Goals */}
                <div>
                  <h3 className="font-semibold text-green-600 mb-3">Completed Goals</h3>
                  {goals.filter(g => g.isCompleted).map((goal) => (
                    <div key={goal.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <span className="line-through text-gray-600">{goal.description}</span>
                        {goal.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed on {new Date(goal.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Achieved
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Active Goals */}
                <div>
                  <h3 className="font-semibold text-blue-600 mb-3">Current Goals</h3>
                  {goals.filter(g => !g.isCompleted).map((goal) => (
                    <div key={goal.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Target className="h-5 w-5 text-blue-500" />
                      <span className="flex-1">{goal.description}</span>
                      <Badge variant="outline">In Progress</Badge>
                    </div>
                  ))}
                </div>

                {/* Goals Progress Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">
                      {goals.filter(g => g.isCompleted).length} of {goals.length} completed
                    </span>
                  </div>
                  <Progress value={(goals.filter(g => g.isCompleted).length / goals.length) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}