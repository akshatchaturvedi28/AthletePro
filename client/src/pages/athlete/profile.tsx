import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Users,
  Instagram,
  Facebook,
  Twitter,
  Save,
  Edit3,
  Target,
  Calendar,
  Trophy
} from "lucide-react";

export default function AthleteProfile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    occupation: "",
    bodyWeight: "",
    bodyHeight: "",
    yearsOfExperience: "",
    bio: "",
    socialHandles: {
      instagram: "",
      facebook: "",
      twitter: ""
    }
  });

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

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        occupation: (user as any).occupation || "",
        bodyWeight: (user as any).bodyWeight || "",
        bodyHeight: (user as any).bodyHeight || "",
        yearsOfExperience: (user as any).yearsOfExperience?.toString() || "",
        bio: (user as any).bio || "",
        socialHandles: {
          instagram: (user as any).socialHandles?.instagram || "",
          facebook: (user as any).socialHandles?.facebook || "",
          twitter: (user as any).socialHandles?.twitter || ""
        }
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
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
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("socialHandles.")) {
      const socialField = field.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialHandles: {
          ...prev.socialHandles,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...formData,
      bodyWeight: formData.bodyWeight ? parseFloat(formData.bodyWeight) : null,
      bodyHeight: formData.bodyHeight ? parseFloat(formData.bodyHeight) : null,
      yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
      socialHandles: Object.keys(formData.socialHandles).some(key => 
        formData.socialHandles[key as keyof typeof formData.socialHandles]
      ) ? formData.socialHandles : null
    };

    updateProfileMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-lg blur opacity-30"></div>
                <div className="relative">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Profile Settings 👤
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
                className={isEditing 
                  ? "hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:border-primary/30 transition-all duration-200"
                  : "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                }
              >
                {isEditing ? "Cancel" : <><Edit3 className="h-4 w-4 mr-2" />Edit Profile</>}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced Profile Overview */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Profile Overview
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xl">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      {(user as any)?.membership && (
                        <Badge variant="outline">
                          <Users className="h-4 w-4 mr-1" />
                          {(user as any).membership.role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">{user?.email}</p>
                    {(user as any)?.membership?.community && (
                      <p className="text-sm text-primary">
                        Member of {(user as any).membership.community.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={true} // Email typically shouldn't be editable
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Contact Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Contact Information
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="occupation" className="text-sm font-medium text-gray-700">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Body Metrics */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Body Metrics
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="bodyWeight" className="text-sm font-medium text-gray-700">Weight (lbs)</Label>
                    <Input
                      id="bodyWeight"
                      type="number"
                      step="0.1"
                      value={formData.bodyWeight}
                      onChange={(e) => handleInputChange("bodyWeight", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bodyHeight" className="text-sm font-medium text-gray-700">Height (inches)</Label>
                    <Input
                      id="bodyHeight"
                      type="number"
                      step="0.1"
                      value={formData.bodyHeight}
                      onChange={(e) => handleInputChange("bodyHeight", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-700">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Bio */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <Edit3 className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Bio
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">About Me</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Social Media */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg mr-3">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Social Media
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="instagram" className="text-sm font-medium text-gray-700">Instagram</Label>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-lg">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                      <Input
                        id="instagram"
                        value={formData.socialHandles.instagram}
                        onChange={(e) => handleInputChange("socialHandles.instagram", e.target.value)}
                        disabled={!isEditing}
                        placeholder="@username"
                        className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="facebook" className="text-sm font-medium text-gray-700">Facebook</Label>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                        <Facebook className="h-4 w-4 text-white" />
                      </div>
                      <Input
                        id="facebook"
                        value={formData.socialHandles.facebook}
                        onChange={(e) => handleInputChange("socialHandles.facebook", e.target.value)}
                        disabled={!isEditing}
                        placeholder="facebook.com/username"
                        className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="twitter" className="text-sm font-medium text-gray-700">Twitter</Label>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-2 rounded-lg">
                        <Twitter className="h-4 w-4 text-white" />
                      </div>
                      <Input
                        id="twitter"
                        value={formData.socialHandles.twitter}
                        onChange={(e) => handleInputChange("socialHandles.twitter", e.target.value)}
                        disabled={!isEditing}
                        placeholder="@username"
                        className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
