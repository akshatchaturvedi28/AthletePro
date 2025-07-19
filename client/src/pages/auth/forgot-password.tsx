import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Mail, Phone, ArrowLeft, Check } from "lucide-react";

interface ForgotPasswordProps {
  userType?: 'user' | 'admin';
}

export default function ForgotPassword({ userType = 'user' }: ForgotPasswordProps) {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(`Reset code sent to your ${method}`);
      setStep('verify');
    } catch (err) {
      setError(`Failed to send reset code to ${method}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formData.otp.length !== 6) {
        throw new Error('Invalid OTP');
      }

      setStep('reset');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('success');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const signInPath = userType === 'admin' ? '/admin/signin' : '/signin';
  const title = userType === 'admin' ? 'Admin Password Reset' : 'Password Reset';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'request' && 'We\'ll send you a code to reset your password'}
            {step === 'verify' && 'Enter the verification code we sent you'}
            {step === 'reset' && 'Create your new password'}
            {step === 'success' && 'Your password has been reset successfully'}
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">
              {step === 'request' && 'Reset Your Password'}
              {step === 'verify' && 'Verify Your Identity'}
              {step === 'reset' && 'Create New Password'}
              {step === 'success' && 'Password Reset Complete'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="flex justify-center space-x-2 mb-4">
                  <Button
                    type="button"
                    variant={method === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMethod('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={method === 'phone' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMethod('phone')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </Button>
                </div>

                {method === 'email' ? (
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      required
                      placeholder="your@email.com"
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

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {successMessage && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : `Send Reset Code via ${method === 'email' ? 'Email' : 'SMS'}`}
                </Button>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData(prev => ({...prev, otp: e.target.value}))}
                    required
                    placeholder="123456"
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code sent to your {method}
                  </p>
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
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('request')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Request
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({...prev, newPassword: e.target.value}))}
                    required
                    className="mt-1"
                    minLength={8}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
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
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Password Reset Successful!</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                </div>

                <Button asChild className="w-full">
                  <Link href={signInPath}>
                    Continue to Sign In
                  </Link>
                </Button>
              </div>
            )}

            {step !== 'success' && (
              <div className="mt-6 text-center">
                <Link href={signInPath} className="text-sm text-primary hover:underline">
                  <ArrowLeft className="h-3 w-3 inline mr-1" />
                  Back to Sign In
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}