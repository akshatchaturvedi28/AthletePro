import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Settings, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Edit3,
  Key,
  Link as LinkIcon,
  Target,
  Trophy,
  Activity,
  Scale,
  Ruler,
  Briefcase,
  Users
} from "lucide-react";
import ForgotPassword from "../auth/forgot-password";

export default function AthleteAccount() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: 'athlete123',
    name: 'Sarah Johnson',
    email: 'sarah@email.com',
    phone: '+1 (555) 987-6543',
    occupation: 'Software Engineer',
    bio: 'CrossFit enthusiast for 3 years. Love challenging WODs and the community spirit!',
    
    // Body Profile
    bodyWeight: '145',
    bodyHeight: '66',
    yearsOfExperience: '3',
    
    // Community
    communityName: 'CrossFit Downtown',
    membershipStatus: 'active',
    joinedCommunityAt: '2022-03-15',
    
    // Goals
    personalGoals: [
      'Complete Murph under 45 minutes',
      'Deadlift 2x bodyweight',
      'Master butterfly pull-ups'
    ],
    
    // Social & Links
    socialHandles: {
      instagram: '@sarahcrossfit',
      strava: 'sarah.johnson'
    }
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    console.log('Saving profile:', formData);
  };

  const addPersonalGoal = (goal: string) => {
    if (goal.trim()) {
      setFormData(prev => ({
        ...prev,
        personalGoals: [...prev.personalGoals, goal.trim()]
      }));
    }
  };

  const removePersonalGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personalGoals: prev.personalGoals.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600">Manage your profile and account settings</p>
        </div>
        <Badge variant="outline">
          Athlete
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="body">Body Profile</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/api/placeholder/100/100" />
                  <AvatarFallback className="text-lg">
                    {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{formData.name}</h3>
                  <p className="text-gray-600">@{formData.username}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Athlete</Badge>
                    {formData.communityName && (
                      <Badge variant="outline">{formData.communityName}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be your public display name</p>
                </div>

                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({...prev, occupation: e.target.value}))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of CrossFit Experience</Label>
                  <Select 
                    value={formData.yearsOfExperience}
                    onValueChange={(value) => setFormData(prev => ({...prev, yearsOfExperience: value}))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Complete Beginner</SelectItem>
                      <SelectItem value="0.5">Less than 6 months</SelectItem>
                      <SelectItem value="1">1 year</SelectItem>
                      <SelectItem value="2">2 years</SelectItem>
                      <SelectItem value="3">3 years</SelectItem>
                      <SelectItem value="4">4 years</SelectItem>
                      <SelectItem value="5">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                    disabled={!isEditing}
                    className="mt-1"
                    rows={3}
                    placeholder="Tell others about your fitness journey..."
                  />
                </div>
              </div>

              {/* Social Handles */}
              <div>
                <Label>Social Media & Links</Label>
                <div className="mt-2 space-y-3">
                  <div>
                    <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialHandles.instagram}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialHandles: {...prev.socialHandles, instagram: e.target.value}
                      }))}
                      disabled={!isEditing}
                      placeholder="@username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="strava" className="text-sm">Strava</Label>
                    <Input
                      id="strava"
                      value={formData.socialHandles.strava}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialHandles: {...prev.socialHandles, strava: e.target.value}
                      }))}
                      disabled={!isEditing}
                      placeholder="username"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3">
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Information */}
          {formData.communityName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Community:</span>
                    <span>{formData.communityName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Member since:</span>
                    <span>{new Date(formData.joinedCommunityAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <Badge variant={formData.membershipStatus === 'active' ? 'default' : 'secondary'}>
                      {formData.membershipStatus}
                    </Badge>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      View Community
                    </Button>
                    <Button variant="outline" size="sm">
                      Leave Community
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="body" className="space-y-6">
          {/* Body Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Body Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bodyWeight" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Body Weight (lbs)
                  </Label>
                  <Input
                    id="bodyWeight"
                    type="number"
                    value={formData.bodyWeight}
                    onChange={(e) => setFormData(prev => ({...prev, bodyWeight: e.target.value}))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bodyHeight" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Height (inches)
                  </Label>
                  <Input
                    id="bodyHeight"
                    type="number"
                    value={formData.bodyHeight}
                    onChange={(e) => setFormData(prev => ({...prev, bodyHeight: e.target.value}))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* BMI Calculation */}
              {formData.bodyWeight && formData.bodyHeight && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">BMI:</span>
                    <span className="text-lg">
                      {(
                        (parseFloat(formData.bodyWeight) / (parseFloat(formData.bodyHeight) * parseFloat(formData.bodyHeight))) * 703
                      ).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    This helps with scaling workouts and tracking progress
                  </p>
                </div>
              )}

              <Button>Update Body Profile</Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">47</div>
                  <div className="text-sm text-gray-600">Workouts</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-gray-600">PRs</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">23</div>
                  <div className="text-sm text-gray-600">Days Active</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">8.7</div>
                  <div className="text-sm text-gray-600">Avg Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Personal Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personal Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {formData.personalGoals.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{goal}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePersonalGoal(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <AddGoalForm onAdd={addPersonalGoal} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          {/* Login Information */}
          <Card>
            <CardHeader>
              <CardTitle>Login Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-gray-600">{formData.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update Email
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Phone Number</p>
                    <p className="text-sm text-gray-600">{formData.phone}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update Phone
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-600">Last updated 2 months ago</p>
                  </div>
                </div>
                <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <ForgotPassword userType="user" />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Linked Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  <div>
                    <p className="font-medium">Google Account</p>
                    <p className="text-sm text-gray-600">{formData.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                <div className="flex items-center space-x-3">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-400">Link Gmail Account</p>
                    <p className="text-sm text-gray-400">Sign in faster with Google</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Link Gmail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your account is secured with encrypted password storage using Bcrypt algorithm.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-sm text-gray-600">Allow others to view your profile and workout history</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show PRs</p>
                    <p className="text-sm text-gray-600">Display your personal records on your profile</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Community Leaderboards</p>
                    <p className="text-sm text-gray-600">Include your scores in community leaderboards</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Workout Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications about new community workouts</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-gray-600">Download your workout history and account data</p>
                </div>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Goal Form Component
function AddGoalForm({ onAdd }: { onAdd: (goal: string) => void }) {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(goal);
    setGoal('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Enter a new goal..."
        className="flex-1"
      />
      <Button type="submit" disabled={!goal.trim()}>
        Add Goal
      </Button>
    </form>
  );
}