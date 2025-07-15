import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "@/components/layout/sidebar";
import { WorkoutParser } from "@/components/workout/workout-parser";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Users, 
  UserPlus, 
  UserMinus,
  MessageSquare,
  Plus,
  Edit3,
  Target,
  Settings,
  Mail,
  Phone,
  Calendar,
  Trophy,
  Trash2,
  Save
} from "lucide-react";
import { format } from "date-fns";

export default function CoachCommunity() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showWorkoutParser, setShowWorkoutParser] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("athlete");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

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

  const { data: members, refetch: refetchMembers } = useQuery({
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

  const { data: announcements, refetch: refetchAnnouncements } = useQuery({
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

  const { data: communityWorkouts, refetch: refetchWorkouts } = useQuery({
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

  const addMemberMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("POST", `/api/communities/${community?.id}/members`, {
        userId,
        role
      });
      return response.json();
    },
    onSuccess: () => {
      refetchMembers();
      setShowAddMember(false);
      setNewMemberEmail("");
      setNewMemberRole("athlete");
      toast({
        title: "Member Added",
        description: "New member has been added to the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Member",
        description: "Could not add member. Please check the email and try again.",
        variant: "destructive",
      });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/communities/${community?.id}/members/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      refetchMembers();
      toast({
        title: "Member Removed",
        description: "Member has been removed from the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove Member",
        description: "Could not remove member. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const response = await apiRequest("POST", `/api/communities/${community?.id}/announcements`, {
        title,
        content
      });
      return response.json();
    },
    onSuccess: () => {
      refetchAnnouncements();
      setShowAnnouncement(false);
      setAnnouncementTitle("");
      setAnnouncementContent("");
      toast({
        title: "Announcement Posted",
        description: "Your announcement has been posted to the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Post Announcement",
        description: "Could not post announcement. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;
    
    // For now, we'll use email as userId - in a real app, you'd look up the user by email
    addMemberMutation.mutate({
      userId: newMemberEmail,
      role: newMemberRole
    });
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    
    createAnnouncementMutation.mutate({
      title: announcementTitle,
      content: announcementContent
    });
  };

  const handleWorkoutCreated = (workout: any) => {
    setShowWorkoutParser(false);
    refetchWorkouts();
    toast({
      title: "Workout Created",
      description: "Community workout has been created successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const athletes = members?.filter((member: any) => member.role === "athlete") || [];
  const coaches = members?.filter((member: any) => member.role === "coach") || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
                <p className="text-gray-600 mt-2">
                  {community?.name || "Your Community"}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowWorkoutParser(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workout
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowAnnouncement(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Post Announcement
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="workouts">Workouts</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Community Members ({members?.length || 0})
                    </CardTitle>
                    <Button onClick={() => setShowAddMember(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Athletes */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-primary" />
                      Athletes ({athletes.length})
                    </h3>
                    {athletes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {athletes.map((member: any) => (
                          <Card key={member.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.user.profileImageUrl} />
                                    <AvatarFallback>
                                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">
                                      {member.user.firstName} {member.user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{member.user.email}</p>
                                  </div>
                                </div>
                                
                                {user?.membership?.role === "manager" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMemberMutation.mutate(member.userId)}
                                  >
                                    <UserMinus className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <Badge variant="secondary">{member.role}</Badge>
                                <span className="text-xs text-gray-500">
                                  Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No athletes yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Coaches */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-accent" />
                      Coaches ({coaches.length})
                    </h3>
                    {coaches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coaches.map((member: any) => (
                          <Card key={member.id} className="border-l-4 border-l-accent">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.user.profileImageUrl} />
                                    <AvatarFallback>
                                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">
                                      {member.user.firstName} {member.user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{member.user.email}</p>
                                  </div>
                                </div>
                                
                                {user?.membership?.role === "manager" && member.role !== "manager" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMemberMutation.mutate(member.userId)}
                                  >
                                    <UserMinus className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <Badge variant="outline">{member.role}</Badge>
                                <span className="text-xs text-gray-500">
                                  Joined {format(new Date(member.joinedAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No coaches yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workouts Tab */}
            <TabsContent value="workouts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Community Workouts ({communityWorkouts?.length || 0})
                    </CardTitle>
                    <Button onClick={() => setShowWorkoutParser(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {communityWorkouts && communityWorkouts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {communityWorkouts.map((workout: any) => (
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
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{Math.round(workout.timeCap / 60)}min</span>
                                </div>
                              )}
                              <span className="text-xs text-gray-500">
                                {format(new Date(workout.createdAt), "MMM d")}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No workouts created yet.</p>
                      <Button 
                        onClick={() => setShowWorkoutParser(true)}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Workout
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Community Announcements ({announcements?.length || 0})
                    </CardTitle>
                    <Button onClick={() => setShowAnnouncement(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Post Announcement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {announcements && announcements.length > 0 ? (
                    <div className="space-y-4">
                      {announcements.map((announcement: any) => (
                        <Card key={announcement.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{announcement.title}</h4>
                              <span className="text-xs text-gray-500">
                                {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{announcement.content}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>By {announcement.creator.firstName} {announcement.creator.lastName}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No announcements yet.</p>
                      <Button 
                        onClick={() => setShowAnnouncement(true)}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Post First Announcement
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Member Dialog */}
          <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="athlete@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="athlete">Athlete</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddMember(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMemberMutation.isPending}>
                    {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Announcement Dialog */}
          <Dialog open={showAnnouncement} onOpenChange={setShowAnnouncement}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Announcement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Announcement title..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="What would you like to announce?"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAnnouncement(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                    {createAnnouncementMutation.isPending ? "Posting..." : "Post Announcement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Workout Parser Modal */}
          {showWorkoutParser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Create Community Workout</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowWorkoutParser(false)}
                    >
                      ×
                    </Button>
                  </div>
                  <WorkoutParser 
                    onWorkoutCreated={handleWorkoutCreated}
                    communityId={community?.id}
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
