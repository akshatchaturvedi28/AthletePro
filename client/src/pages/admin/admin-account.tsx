import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  Building,
  FileText,
  Bell,
  Eye,
  EyeOff
} from "lucide-react";
import ForgotPassword from "../auth/forgot-password";

export default function AdminAccount() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Smith',
    email: 'john@crossfitdowntown.com',
    phone: '+1 (555) 123-4567',
    bio: 'CrossFit L2 Coach with 5+ years of experience. Passionate about helping athletes reach their potential.',
    gymName: 'CrossFit Downtown',
    location: 'New York, NY',
    socialHandles: {
      instagram: '@crossfitdowntown',
      facebook: 'facebook.com/crossfitdowntown',
      website: 'https://crossfitdowntown.com'
    },
    certifications: [
      'CrossFit Level 2 Trainer',
      'First Aid/CPR Certified',
      'Mobility Specialist'
    ],
    experience: '5 years',
    specializations: 'Olympic Lifting, Mobility, Beginner Programming'
  });

  const handleSaveProfile = () => {
    // In production, this would save to the backend
    setIsEditing(false);
    console.log('Saving profile:', formData);
  };

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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Admin Account</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="capitalize">
            Coach
          </Badge>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700">
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
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
                  <p className="text-gray-600">{formData.email}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Coach</Badge>
                    <Badge variant="outline">{formData.gymName}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
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
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({...prev, experience: e.target.value}))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="specializations">Specializations</Label>
                  <Input
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => setFormData(prev => ({...prev, specializations: e.target.value}))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div>
                <Label>Certifications</Label>
                <div className="mt-2 space-y-2">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span>{cert}</span>
                      {isEditing && (
                        <Button size="sm" variant="ghost">
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      Add Certification
                    </Button>
                  )}
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
                      placeholder="@yourgym"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialHandles.facebook}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialHandles: {...prev.socialHandles, facebook: e.target.value}
                      }))}
                      disabled={!isEditing}
                      placeholder="facebook.com/yourgym"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-sm">Website</Label>
                    <Input
                      id="website"
                      value={formData.socialHandles.website}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialHandles: {...prev.socialHandles, website: e.target.value}
                      }))}
                      disabled={!isEditing}
                      placeholder="https://yourgym.com"
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
                    <p className="text-sm text-gray-600">Last updated 3 months ago</p>
                  </div>
                </div>
                <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <ForgotPassword userType="admin" />
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
                    <p className="text-sm text-gray-600">john@gmail.com</p>
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
                    <p className="font-medium text-gray-400">Link Account</p>
                    <p className="text-sm text-gray-400">Connect additional sign-in methods</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Link Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          {/* Community Information */}
          <Card>
            <CardHeader>
              <CardTitle>Community Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gymName">Gym/Community Name</Label>
                <Input
                  id="gymName"
                  value={formData.gymName}
                  onChange={(e) => setFormData(prev => ({...prev, gymName: e.target.value}))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-3">
                <Button>Save Changes</Button>
                <Button variant="outline">View Community Page</Button>
              </div>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Community Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">47</div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-gray-600">Coaches</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-gray-600">Workouts Created</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">2.1k</div>
                  <div className="text-sm text-gray-600">Total Logs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Member Joins</p>
                    <p className="text-sm text-gray-600">Get notified when someone joins your community</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Workout Completions</p>
                    <p className="text-sm text-gray-600">Daily summary of workout completions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Personal Records</p>
                    <p className="text-sm text-gray-600">When athletes achieve new PRs</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Community Announcements</p>
                    <p className="text-sm text-gray-600">Updates and announcements from management</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Notification Method</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="notification-method" defaultChecked />
                    <span>Email notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="notification-method" />
                    <span>SMS notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="notification-method" />
                    <span>Both email and SMS</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your account is secured with encrypted password storage using Bcrypt algorithm.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Login Activity</p>
                    <p className="text-sm text-gray-600">View recent login attempts and active sessions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Activity
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Data Export</p>
                    <p className="text-sm text-gray-600">Download your account data and workout history</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-sm text-gray-600">Permanently delete your admin account and all associated data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}