import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Dumbbell, BarChart, Settings, Activity, TrendingUp, LogOut, User, ChevronDown } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminConsole() {
  const { user, admin, isLoading, isAuthenticated, accountType, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/admin/signin';
    }
  }, [isLoading, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!admin || accountType !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access the admin console.</p>
            <Button onClick={() => window.location.href = '/admin/signin'} className="mt-4">
              Go to Admin Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Console</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {admin?.role || 'Admin'}
                </Badge>
                <span className="text-gray-600">
                  {admin?.email}
                </span>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {admin?.firstName || admin?.email || 'Admin'}
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

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">
                    Active community members
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">
                    Community workouts created
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">
                    Workout logs recorded
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Loading...</div>
                  <p className="text-xs text-muted-foreground">
                    Average weekly participation
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New member joined</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Workout completed</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New workout created</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Create Workout
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Community Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage your community members, roles, and permissions.
                </p>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Go to Community Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workout Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Create, edit, and manage community workouts.
                </p>
                <div className="space-y-3">
                  <Button className="w-full justify-start">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Create New Workout
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    View All Workouts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Track performance metrics and community engagement.
                </p>
                <Button>
                  <BarChart className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
