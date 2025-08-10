import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Mail, Lock, Phone, Shield } from "lucide-react";

export default function AdminSignIn() {
  const [signInMethod, setSignInMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const identifier = signInMethod === 'email' ? formData.email : formData.phone;
      const password = formData.password;

      if (!identifier) {
        throw new Error(`Please enter your ${signInMethod}`);
      }
      if (!password) {
        throw new Error('Please enter your password');
      }

      // Call the admin authentication API
      const response = await fetch('/api/auth/admin/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: identifier,
          password
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Admin sign in successful:', result.user);
        // Redirect to admin console after successful login
        window.location.href = '/admin/console';
      } else {
        throw new Error(result.message || 'Invalid credentials');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.');
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
            Admin Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your community management dashboard
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">Sign in to Admin Console</CardTitle>
            <div className="flex justify-center space-x-2">
              <Button
                variant={signInMethod === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSignInMethod('email')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant={signInMethod === 'phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSignInMethod('phone')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {signInMethod === 'email' ? (
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
              ) : (
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
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  required
                  className="mt-1"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

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
                  onClick={() => window.location.href = '/api/login'}
                >
                  Continue with Google
                </Button>
                
                <div className="text-center space-y-2">
                  <Link href="/admin/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot your password?
                  </Link>
                  
                  <div className="text-sm text-gray-600">
                    Don't have an admin account?{' '}
                    <Link href="/admin/signup" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Are you an athlete?{' '}
                    <Link href="/signin" className="text-primary hover:underline">
                      Athlete Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
