import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Settings, 
  Calendar,
  Trophy,
  MessageSquare,
  FileText,
  UserCheck,
  UserX,
  Plus,
  Edit3,
  Trash2,
  Eye,
  MoreHorizontal
} from "lucide-react";

interface Community {
  id: string;
  name: string;
  location: string;
  description: string;
  memberCount: number;
  coachCount: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'athlete' | 'coach';
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'inactive';
  workoutCount: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'schedule' | 'event' | 'maintenance';
  createdAt: string;
  author: string;
}

export default function ManageCommunity() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [memberFilter, setMemberFilter] = useState<'all' | 'athletes' | 'coaches'>('all');

  // Fetch community data
  const { data: community, isLoading: communityLoading } = useQuery<Community>({
    queryKey: ['/api/admin/community'],
    enabled: true
  });

  // Fetch members
  const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ['/api/admin/community/members'],
    enabled: true
  });

  // Fetch announcements
  const { data: announcements = [], isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/admin/community/announcements'],
    enabled: true
  });

  // Member management mutations
  const addMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: 'athlete' | 'coach' }) => 
      apiRequest('/api/admin/community/members', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/members'] });
      setShowAddMember(false);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => 
      apiRequest(`/api/admin/community/members/${memberId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/members'] });
    }
  });

  // Announcement mutations
  const createAnnouncementMutation = useMutation({
    mutationFn: (data: { title: string; content: string; type: string }) => 
      apiRequest('/api/admin/community/announcements', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/community/announcements'] });
      setShowAddAnnouncement(false);
    }
  });

  const filteredMembers = members.filter(member => {
    if (memberFilter === 'all') return true;
    if (memberFilter === 'athletes') return member.role === 'athlete';
    if (memberFilter === 'coaches') return member.role === 'coach';
    return true;
  });

  if (communityLoading) {
    return <div className="p-6">Loading community data...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Community</h1>
          <p className="text-gray-600">{community?.name} - {community?.location}</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Community Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{community?.memberCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{community?.coachCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              2 online now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              Workout completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">
              3 pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Community Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Community Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Community Vision</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Building a strong, supportive fitness community where everyone achieves their goals.
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Years in Business</Label>
                  <p className="text-sm text-gray-600 mt-1">5 years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Class Schedule</Label>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <div>Mon-Fri: 6AM, 9AM, 12PM, 6PM, 7PM</div>
                    <div>Saturday: 8AM, 10AM</div>
                    <div>Sunday: 10AM</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Overview
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">John Doe completed "Fran"</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <Badge variant="secondary">PR</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Sarah Miller joined the community</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">Coach Mike posted today's WOD</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                    <Badge variant="default">WOD</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Members Header */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button
                variant={memberFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('all')}
              >
                All ({members.length})
              </Button>
              <Button
                variant={memberFilter === 'athletes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('athletes')}
              >
                Athletes ({members.filter(m => m.role === 'athlete').length})
              </Button>
              <Button
                variant={memberFilter === 'coaches' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMemberFilter('coaches')}
              >
                Coaches ({members.filter(m => m.role === 'coach').length})
              </Button>
            </div>

            <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <AddMemberForm 
                  onSubmit={(data) => addMemberMutation.mutate(data)}
                  isLoading={addMemberMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Members Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Workouts</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'coach' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(member.lastActive).toLocaleDateString()}</TableCell>
                      <TableCell>{member.workoutCount}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => removeMemberMutation.mutate(member.id)}
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          {/* Announcements Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Community Announcements</h3>
            <Dialog open={showAddAnnouncement} onOpenChange={setShowAddAnnouncement}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <CreateAnnouncementForm 
                  onSubmit={(data) => createAnnouncementMutation.mutate(data)}
                  isLoading={createAnnouncementMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{announcement.type}</Badge>
                        <span className="text-sm text-gray-500">
                          by {announcement.author} • {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar Coming Soon</h3>
                <p className="text-gray-600">
                  Community calendar with workout scheduling will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Detailed analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Member Form Component
function AddMemberForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'athlete' as 'athlete' | 'coach'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
          required
          placeholder="member@email.com"
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <select
          value={formData.role}
          onChange={(e) => setFormData(prev => ({...prev, role: e.target.value as 'athlete' | 'coach'}))}
          className="w-full p-2 border rounded-md"
        >
          <option value="athlete">Athlete</option>
          <option value="coach">Coach</option>
        </select>
      </div>

      <div className="flex space-x-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Adding...' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
}

// Create Announcement Form Component
function CreateAnnouncementForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Announcement Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
          required
          placeholder="Important announcement..."
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))}
          className="w-full p-2 border rounded-md"
        >
          <option value="general">General</option>
          <option value="schedule">Schedule Change</option>
          <option value="event">Event</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
          required
          placeholder="Announcement details..."
          rows={4}
        />
      </div>

      <div className="flex space-x-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating...' : 'Create Announcement'}
        </Button>
      </div>
    </form>
  );
}