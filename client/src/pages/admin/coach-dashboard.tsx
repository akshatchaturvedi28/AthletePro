import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Calendar,
  Trophy,
  MessageSquare,
  FileText,
  UserCheck,
  Plus,
  Edit3,
  Clock,
  Target,
  Activity,
  Dumbbell,
  CheckCircle,
  XCircle,
  Star,
  NotebookPen,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";

interface Athlete {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lastActive: string;
  workoutCount: number;
  personalBests: number;
  notes: string;
  status: 'active' | 'inactive';
}

interface WorkoutLog {
  id: string;
  athleteName: string;
  workoutName: string;
  score: string;
  completedAt: string;
  isPR: boolean;
}

interface TodaysWOD {
  id: string;
  name: string;
  type: string;
  description: string;
  timeCap: number;
  date: string;
  completionCount: number;
}

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateWOD, setShowCreateWOD] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = '/admin/signin?message=Successfully logged out';
      } else {
        console.error('Logout failed');
        window.location.href = '/admin/signin';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/admin/signin';
    }
  };

  // Fetch athletes
  const { data: athletes = [], isLoading: athletesLoading } = useQuery<Athlete[]>({
    queryKey: ['/api/coach/athletes'],
    enabled: true
  });

  // Fetch today's WOD
  const { data: todaysWOD, isLoading: wodLoading } = useQuery<TodaysWOD>({
    queryKey: ['/api/coach/todays-wod'],
    enabled: true
  });

  // Fetch recent workout logs
  const { data: recentLogs = [], isLoading: logsLoading } = useQuery<WorkoutLog[]>({
    queryKey: ['/api/coach/recent-logs'],
    enabled: true
  });

  // Create WOD mutation
  const createWODMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/coach/workouts', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/todays-wod'] });
      setShowCreateWOD(false);
    }
  });

  // Update athlete notes mutation
  const updateAthleteNotesMutation = useMutation({
    mutationFn: (data: { athleteId: string; notes: string }) => 
      apiRequest(`/api/coach/athletes/${data.athleteId}/notes`, { 
        method: 'PATCH', 
        body: { notes: data.notes } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/athletes'] });
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <p className="text-gray-600">Manage your athletes and community workouts</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserCheck className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Today's Attendance</DialogTitle>
              </DialogHeader>
              <AttendanceForm athletes={athletes} />
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateWOD} onOpenChange={setShowCreateWOD}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Today's WOD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Workout of the Day</DialogTitle>
              </DialogHeader>
              <CreateWODForm 
                onSubmit={(data) => createWODMutation.mutate(data)}
                isLoading={createWODMutation.isPending}
              />
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Coach
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.href = '/admin/admin-account'}>
                <User className="h-4 w-4 mr-2" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Athletes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{athletes.length}</div>
            <p className="text-xs text-muted-foreground">
              {athletes.filter(a => a.status === 'active').length} active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's WOD</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysWOD?.completionCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Records</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentLogs.filter(log => log.isPR).length}
            </div>
            <p className="text-xs text-muted-foreground">
              PRs this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Weekly participation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's WOD Card */}
      {todaysWOD && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's WOD: {todaysWOD.name}
              </CardTitle>
              <Badge variant="outline">{todaysWOD.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 p-4 rounded-lg">
                {todaysWOD.description}
              </pre>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {todaysWOD.timeCap} min cap
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      {todaysWOD.completionCount} completions
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Edit3 className="h-3 w-3 mr-2" />
                  Edit WOD
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="athletes">Athletes</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
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
                  {recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {log.athleteName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{log.athleteName}</p>
                          <p className="text-xs text-gray-500">
                            {log.workoutName} - {log.score}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {log.isPR && <Badge variant="default">PR</Badge>}
                        <span className="text-xs text-gray-500">
                          {new Date(log.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Post Announcement
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Blog Post
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Workout
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Community Leaderboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="athletes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Athletes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Workouts</TableHead>
                    <TableHead>PRs</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {athletes.map((athlete) => (
                    <TableRow key={athlete.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{athlete.name}</p>
                          <p className="text-sm text-gray-500">{athlete.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{athlete.workoutCount}</TableCell>
                      <TableCell>{athlete.personalBests}</TableCell>
                      <TableCell>{new Date(athlete.lastActive).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={athlete.status === 'active' ? 'default' : 'secondary'}>
                          {athlete.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate">
                          {athlete.notes || 'No notes'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedAthlete(athlete)}
                          >
                            <NotebookPen className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Athlete Notes Dialog */}
          <Dialog open={!!selectedAthlete} onOpenChange={() => setSelectedAthlete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Athlete Notes - {selectedAthlete?.name}</DialogTitle>
              </DialogHeader>
              <AthleteNotesForm
                athlete={selectedAthlete}
                onSubmit={(data) => {
                  updateAthleteNotesMutation.mutate(data);
                  setSelectedAthlete(null);
                }}
                isLoading={updateAthleteNotesMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Leaderboard Coming Soon</h3>
                <p className="text-gray-600">
                  View athlete rankings for today's workout and historical performance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Workout Calendar Coming Soon</h3>
                <p className="text-gray-600">
                  Create, schedule, and manage community workouts for past and future dates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Create WOD Form Component
function CreateWODForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'For Time',
    description: '',
    timeCap: 20,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
          required
          placeholder="e.g., Fran, Today's WOD"
        />
      </div>

      <div>
        <Label htmlFor="type">Workout Type</Label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
          className="w-full p-2 border rounded-md"
        >
          <option value="For Time">For Time</option>
          <option value="AMRAP">AMRAP</option>
          <option value="EMOM">EMOM</option>
          <option value="Strength">Strength</option>
          <option value="Tabata">Tabata</option>
        </select>
      </div>

      <div>
        <Label htmlFor="description">Workout Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
          required
          placeholder={`21-15-9 reps for time of:\nThrusters (95/65 lb)\nPull-ups`}
          rows={6}
        />
      </div>

      <div>
        <Label htmlFor="timeCap">Time Cap (minutes)</Label>
        <Input
          id="timeCap"
          type="number"
          value={formData.timeCap}
          onChange={(e) => setFormData(prev => ({...prev, timeCap: parseInt(e.target.value)}))}
          required
          min={1}
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Workout'}
      </Button>
    </form>
  );
}

// Attendance Form Component
function AttendanceForm({ athletes }: { athletes: Athlete[] }) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const toggleAttendance = (athleteId: string) => {
    setAttendance(prev => ({
      ...prev,
      [athleteId]: !prev[athleteId]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {athlete.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{athlete.name}</p>
              </div>
            </div>
            <Button
              variant={attendance[athlete.id] ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleAttendance(athlete.id)}
            >
              {attendance[athlete.id] ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-sm text-gray-600">
          {Object.values(attendance).filter(Boolean).length} of {athletes.length} present
        </span>
        <Button>Save Attendance</Button>
      </div>
    </div>
  );
}

// Athlete Notes Form Component
function AthleteNotesForm({ 
  athlete, 
  onSubmit, 
  isLoading 
}: { 
  athlete: Athlete | null; 
  onSubmit: (data: { athleteId: string; notes: string }) => void; 
  isLoading: boolean;
}) {
  const [notes, setNotes] = useState(athlete?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (athlete) {
      onSubmit({ athleteId: athlete.id, notes });
    }
  };

  if (!athlete) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="notes">Personal Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Track injuries, preferences, modifications, goals, etc..."
          rows={6}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Save Notes'}
      </Button>
    </form>
  );
}