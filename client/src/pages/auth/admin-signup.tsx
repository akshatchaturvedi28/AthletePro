import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Shield, Info } from "lucide-react";

export default function AdminSignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    name: '',
    role: 'coach' as 'manager' | 'coach',
    gymName: '',
    location: '',
    bio: '',
    socialHandles: {
      instagram: '',
      facebook: '',
      website: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setError('');
      setStep(2);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create admin account
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || formData.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch('/api/auth/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
          role: formData.role === 'manager' ? 'community_manager' : 'coach'
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Admin account created successfully:', result);
        window.location.href = '/admin/signin?message=Account created successfully. Please sign in.';
      } else {
        throw new Error(result.message || 'Failed to create account');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Admin Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join as a Community Manager or Coach
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">
              {step === 1 ? 'Account Information' : 'Community Details'}
            </CardTitle>
            <div className="flex justify-center space-x-2">
              <div className={`w-8 h-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-gray-300'}`} />
              <div className={`w-8 h-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      required
                      placeholder="admin@gym.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      required
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">
                      Password
                      <Info className="inline h-3 w-3 ml-1 text-gray-400" />
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      required
                      className="mt-1"
                      minLength={8}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                      required
                      className="mt-1"
                      minLength={8}
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      required
                      placeholder="John Smith"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select onValueChange={(value: 'manager' | 'coach') => setFormData(prev => ({...prev, role: value}))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Community Manager</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="gymName">Gym/Community Name</Label>
                    <Input
                      id="gymName"
                      type="text"
                      value={formData.gymName}
                      onChange={(e) => setFormData(prev => ({...prev, gymName: e.target.value}))}
                      required
                      placeholder="CrossFit Downtown"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                      required
                      placeholder="New York, NY"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                      placeholder="Tell us about yourself and your coaching experience..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Social Handles (Optional)</Label>
                    
                    <div>
                      <Input
                        type="text"
                        value={formData.socialHandles.instagram}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          socialHandles: {...prev.socialHandles, instagram: e.target.value}
                        }))}
                        placeholder="@yourgym"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Input
                        type="text"
                        value={formData.socialHandles.facebook}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          socialHandles: {...prev.socialHandles, facebook: e.target.value}
                        }))}
                        placeholder="facebook.com/yourgym"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Input
                        type="url"
                        value={formData.socialHandles.website}
                        onChange={(e) => setFormData(prev => ({
                          ...prev, 
                          socialHandles: {...prev.socialHandles, website: e.target.value}
                        }))}
                        placeholder="https://yourgym.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-3">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : (step === 1 ? 'Next' : 'Create Account')}
                </Button>
              </div>
            </form>

            {step === 1 && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/auth/login'}
                  >
                    Continue with Google
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    Already have an admin account?{' '}
                    <Link href="/admin/signin" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
